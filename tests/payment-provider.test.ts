// @vitest-environment node
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createProviderCheckout, retrieveProviderCheckout, retrieveProviderRefund, validateProviderCheckout,
  validateProviderRefund, verifyProviderWebhook, type CheckoutAttemptInput, type PaidProviderConfiguration,
  type ProviderCheckoutSession, type ProviderRefund,
} from "@/lib/submissions/payment-provider";

// Deliberately fake credentials. Every fetch is replaced before any test runs.
const config: PaidProviderConfiguration = {
  secretKey: "sk_test_localfixture", webhookSecret: "whsec_localfixture",
  origin: "https://veronicahub.com", environment: "test",
};
const now = 1_790_000_000;
const input: CheckoutAttemptInput = {
  submissionId: "34e787e6-43c5-4c24-b125-bd91de10f9e9",
  attemptId: "8bcba58f-ac76-44ae-89f1-cfca2d719b43",
  idempotencyKey: "veronica:paid:8bcba58f-ac76-44ae-89f1-cfca2d719b43",
  expiresAt: now + 3600,
};
function checkout(overrides: Partial<ProviderCheckoutSession> = {}): ProviderCheckoutSession {
  return {
    id: "cs_test_fixture", url: "https://checkout.stripe.com/c/pay/cs_test_fixture#stripeOpaqueFragment",
    mode: "payment", status: "open", payment_status: "unpaid", amount_total: 990, currency: "usd",
    livemode: false, expires_at: input.expiresAt, payment_intent: null,
    metadata: { purpose: "veronica-paid-submission-v1", submissionId: input.submissionId, attemptId: input.attemptId },
    client_reference_id: input.submissionId, ...overrides,
  };
}
function refund(overrides: Partial<ProviderRefund> = {}): ProviderRefund {
  return { id: "re_fixture", amount: 990, currency: "usd", payment_intent: "pi_fixture", status: "succeeded", ...overrides };
}
function event(overrides: Record<string, unknown> = {}) {
  return { id: "evt_fixture", type: "checkout.session.completed", created: now, livemode: false, data: { object: { id: "cs_test_fixture" } }, ...overrides };
}
function sign(rawBody: string, time: string | number = now, secret = config.webhookSecret) {
  return createHmac("sha256", secret).update(`${time}.${rawBody}`).digest("hex");
}
function signature(rawBody: string, time = now) { return `t=${time},v1=${sign(rawBody, time)}`; }
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
function respond(value: unknown, status = 200) { fetchMock.mockResolvedValueOnce(Response.json(value, { status })); }

describe("Stripe Checkout REST adapter", () => {
  it("creates exactly the fixed one-time 990 USD-cent card payment without private submission data", async () => {
    respond({ ...checkout(), customer_email: "do-not-return@private.dev", client_secret: "do-not-return", object: "checkout.session" });
    expect(await createProviderCheckout(config, input)).toEqual(checkout());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.stripe.com/v1/checkout/sessions");
    expect(options).toMatchObject({ method: "POST", cache: "no-store", redirect: "error", credentials: "omit" });
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(options?.headers).toEqual({
      Authorization: `Bearer ${config.secretKey}`, Accept: "application/json", "Stripe-Version": "2026-09-30.endive",
      "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": input.idempotencyKey,
    });
    expect(Object.fromEntries(new URLSearchParams(options?.body as string))).toEqual({
      mode: "payment", "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "usd", "line_items[0][price_data][unit_amount]": "990",
      "line_items[0][price_data][product_data][name]": "Veronica Hub paid submission", "line_items[0][quantity]": "1",
      "adaptive_pricing[enabled]": "false", "automatic_tax[enabled]": "false", allow_promotion_codes: "false",
      client_reference_id: input.submissionId, "metadata[purpose]": "veronica-paid-submission-v1",
      "metadata[submissionId]": input.submissionId, "metadata[attemptId]": input.attemptId,
      success_url: "https://veronicahub.com/submit-tool/status", cancel_url: "https://veronicahub.com/submit-tool/status",
      expires_at: String(input.expiresAt),
    });
  });

  it("preserves the durable idempotency key and expiration even on a later retry", async () => {
    vi.useFakeTimers(); vi.setSystemTime(now * 1000);
    respond(checkout()); respond(checkout({ status: "complete", payment_status: "paid", payment_intent: "pi_fixture", url: null }));
    await createProviderCheckout(config, input);
    vi.setSystemTime((now + 7200) * 1000);
    const recovered = await createProviderCheckout(config, input);
    expect(recovered.status).toBe("complete");
    expect(recovered.url).toBeNull();
    expect(fetchMock.mock.calls[0][1]?.body).toBe(fetchMock.mock.calls[1][1]?.body);
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual(fetchMock.mock.calls[1][1]?.headers);
  });

  it.each([
    "https://veronicahub.com/", "https://veronicahub.com/path", "https://veronicahub.com?private=token",
    "https://veronicahub.com#token", "https://user:password@veronicahub.com", "http://veronicahub.com", "javascript:alert(1)",
  ])("rejects noncanonical or unsafe return origin %s before fetching", async origin => {
    await expect(createProviderCheckout({ ...config, origin }, input)).rejects.toMatchObject({ code: "payment_provider" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows a test-only localhost origin and rejects it in live mode", async () => {
    respond(checkout());
    await createProviderCheckout({ ...config, origin: "http://localhost:3000" }, input);
    const body = new URLSearchParams(fetchMock.mock.calls[0][1]?.body as string);
    expect(body.get("success_url")).toBe("http://localhost:3000/submit-tool/status");
    await expect(createProviderCheckout({ ...config, origin: "http://localhost:3000", environment: "live", secretKey: "sk_live_fixture" }, input)).rejects.toMatchObject({ code: "payment_provider" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    { submissionId: "not-a-uuid" }, { attemptId: "not-a-uuid" }, { idempotencyKey: "" },
    { idempotencyKey: "secret\r\nHeader: injected" }, { idempotencyKey: "a".repeat(256) },
    { expiresAt: 0 }, { expiresAt: 1.5 }, { expiresAt: Number.MAX_SAFE_INTEGER + 1 }, { token: "private-access-token" },
  ])("rejects invalid or unexpected creation inputs without fetching: %j", async override => {
    await expect(createProviderCheckout(config, { ...input, ...override })).rejects.toMatchObject({ code: "payment_provider" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a key/environment mismatch before fetching", async () => {
    await expect(createProviderCheckout({ ...config, environment: "live" }, input)).rejects.toMatchObject({ code: "payment_provider" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a different expiration in a created Checkout", async () => {
    respond(checkout({ expires_at: input.expiresAt + 1 }));
    await expect(createProviderCheckout(config, input)).rejects.toMatchObject({ code: "payment_mismatch" });
  });

  it("retrieves a terminal session with null URL using a noncached GET", async () => {
    const completed = checkout({ status: "complete", payment_status: "paid", payment_intent: "pi_fixture", url: null });
    respond(completed);
    expect(await retrieveProviderCheckout(config, completed.id)).toEqual(completed);
    expect(fetchMock).toHaveBeenCalledWith("https://api.stripe.com/v1/checkout/sessions/cs_test_fixture", expect.objectContaining({ method: "GET", cache: "no-store", redirect: "error" }));
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty("body");
  });

  it.each(["cs_test_x/../refunds", "cs_test_x?expand[]=customer", "cs_test_x#fragment", "https://evil.dev", "cs_test_%2f", "cs_test_" + "a".repeat(200)])("rejects unsafe provider object ID %s", async id => {
    await expect(retrieveProviderCheckout(config, id)).rejects.toMatchObject({ code: "payment_provider" });
    await expect(retrieveProviderRefund(config, id)).rejects.toMatchObject({ code: "payment_provider" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    "http://checkout.stripe.com/c/pay/cs_test_fixture", "https://checkout.stripe.com.evil.dev/c/pay/cs_test_fixture",
    "https://user:pass@checkout.stripe.com/c/pay/cs_test_fixture", "https://checkout.stripe.com:444/c/pay/cs_test_fixture",
    "https://evil.dev/c/pay/cs_test_fixture", "//checkout.stripe.com/c/pay/cs_test_fixture",
    "javascript:alert(1)", "https://checkout.stripe.com/login", "https://checkout.stripe.com/c/pay/cs_test_other",
    "https://checkout.stripe.com/c/pay/cs_test_fixture?return_url=https://evil.dev", " https://checkout.stripe.com/c/pay/cs_test_fixture",
    "https://checkout.stripe.com\\@evil.dev/c/pay/cs_test_fixture", "https://checkout.stripe.com/c/pay/cs_test_fixture#" + "x".repeat(8192),
  ])("rejects an unsafe or misbound Checkout URL %s", async url => {
    respond(checkout({ url }));
    await expect(retrieveProviderCheckout(config, "cs_test_fixture")).rejects.toMatchObject({ code: "payment_provider" });
  });

  it.each([
    { id: "cs_test_other", url: "https://checkout.stripe.com/c/pay/cs_test_other" },
    { amount_total: "990" }, { amount_total: null }, { amount_total: 990.5 }, { amount_total: -1 },
    { currency: null }, { expires_at: 0 }, { expires_at: 1.5 }, { status: "unknown" }, { payment_status: "unknown" },
    { payment_status: "paid", status: "complete", payment_intent: null }, { payment_status: "paid", payment_intent: "pi_fixture" },
    { payment_intent: { id: "pi_fixture" } }, { livemode: "false" }, { url: null },
    { metadata: {} }, { metadata: { ...checkout().metadata, token: "private" } }, { client_reference_id: null },
  ])("rejects unexpected Checkout response shape: %j", async override => {
    respond({ ...checkout(), ...override });
    await expect(retrieveProviderCheckout(config, "cs_test_fixture")).rejects.toMatchObject({ code: "payment_provider" });
  });

  it.each([400, 401, 429, 500])("sanitizes provider HTTP %i errors and does not retry", async status => {
    respond({ error: { message: "private provider error with sk_test_secret" } }, status);
    await expect(retrieveProviderCheckout(config, "cs_test_fixture")).rejects.toMatchObject({ code: "payment_provider", status: 502, message: "The payment provider could not verify this request. Please try again later." });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sanitizes malformed JSON, network errors, and redirects", async () => {
    fetchMock.mockResolvedValueOnce(new Response("secret not JSON"));
    fetchMock.mockRejectedValueOnce(new Error("private connection failure"));
    const redirect = Response.json(checkout()); Object.defineProperty(redirect, "redirected", { value: true });
    fetchMock.mockResolvedValueOnce(redirect);
    for (let i = 0; i < 3; i++) await expect(retrieveProviderCheckout(config, "cs_test_fixture")).rejects.toMatchObject({ code: "payment_provider", message: "The payment provider could not verify this request. Please try again later." });
  });

  it("aborts a hanging provider call after ten seconds and clears timers", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(new Error("provider details must not escape")));
    }));
    const pending = expect(retrieveProviderCheckout(config, "cs_test_fixture")).rejects.toMatchObject({ code: "payment_provider" });
    await vi.advanceTimersByTimeAsync(10_000);
    await pending;
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears the timeout after a successful response", async () => {
    vi.useFakeTimers(); respond(checkout());
    await retrieveProviderCheckout(config, "cs_test_fixture");
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("authoritative payment bindings", () => {
  it("accepts a matching checkout without treating unpaid as paid", () => {
    expect(() => validateProviderCheckout(checkout(), config, input)).not.toThrow();
    expect(() => validateProviderCheckout(checkout({ livemode: true }), { ...config, environment: "live" }, input)).not.toThrow();
  });
  it.each([
    { mode: "subscription" }, { mode: "setup" }, { amount_total: 989 }, { amount_total: 991 }, { currency: "eur" }, { livemode: true },
    { metadata: { ...checkout().metadata, purpose: "other-purpose" } },
    { metadata: { ...checkout().metadata, submissionId: "another-submission" } },
    { metadata: { ...checkout().metadata, attemptId: "another-attempt" } }, { client_reference_id: "another-submission" },
  ] satisfies Partial<ProviderCheckoutSession>[]) ("rejects a Checkout binding mismatch: %j", override => {
    expect(() => validateProviderCheckout(checkout(override), config, input)).toThrow(expect.objectContaining({ code: "payment_mismatch" }));
  });
  it("retrieves a refund through the fixed Stripe path and strips extra fields", async () => {
    respond({ ...refund(), object: "refund", instructions_email: "do-not-return@private.dev" });
    expect(await retrieveProviderRefund(config, "re_fixture")).toEqual(refund());
    expect(fetchMock).toHaveBeenCalledWith("https://api.stripe.com/v1/refunds/re_fixture", expect.objectContaining({ method: "GET", cache: "no-store", redirect: "error" }));
    expect(() => validateProviderRefund(refund(), "pi_fixture")).not.toThrow();
  });
  it.each([{ id: "re_other" }, { amount: "990" }, { status: "unknown" }, { payment_intent: { id: "pi_fixture" } }])("rejects a malformed or wrong-ID refund: %j", async override => {
    respond({ ...refund(), ...override });
    await expect(retrieveProviderRefund(config, "re_fixture")).rejects.toMatchObject({ code: "payment_provider" });
  });
  it.each([
    { amount: 989 }, { amount: 991 }, { currency: "eur" }, { status: "pending" }, { status: "requires_action" },
    { status: "failed" }, { status: "canceled" }, { status: null }, { payment_intent: null }, { payment_intent: "pi_another" },
  ] satisfies Partial<ProviderRefund>[]) ("requires the exact succeeded original-payment refund: %j", override => {
    expect(() => validateProviderRefund(refund(override), "pi_fixture")).toThrow(expect.objectContaining({ code: "payment_mismatch" }));
  });
});

describe("raw Stripe webhook verification", () => {
  it("verifies the raw UTF-8 body and returns only the minimum event fields", () => {
    const raw = JSON.stringify(event({ description: "原始字节", data: { object: { id: "cs_test_fixture", metadata: { token: "never-return" }, customer_email: "private@hidden.dev" } } }), null, 2);
    expect(verifyProviderWebhook(raw, signature(raw), config, now)).toEqual(event());
    expect(() => verifyProviderWebhook(JSON.stringify(JSON.parse(raw)), signature(raw), config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("preserves only bounded purpose and payment-status hints from a signed snapshot", () => {
    const raw = JSON.stringify(event({
      customer_email: "never-return@hidden.dev",
      data: { object: {
        id: "cs_test_fixture", payment_status: "paid", amount_total: 990, payment_intent: "pi_private",
        metadata: { purpose: "veronica-paid-submission-v1", submissionId: input.submissionId, attemptId: input.attemptId, token: "never-return" },
        customer: { email: "never-return@hidden.dev" },
      } },
    }));
    expect(verifyProviderWebhook(raw, signature(raw), config, now)).toStrictEqual(event({ data: { object: {
      id: "cs_test_fixture", metadata: { purpose: "veronica-paid-submission-v1" }, payment_status: "paid",
    } } }));
  });
  it.each([
    { metadata: { token: "private" }, payment_status: null },
    { metadata: null, payment_status: 990 },
    { metadata: { purpose: { token: "private" } }, payment_status: { secret: "private" } },
    { metadata: ["private"] },
  ])("omits non-string optional snapshot hints without exposing their contents: %j", hints => {
    const raw = JSON.stringify(event({ data: { object: { id: "cs_test_fixture", ...hints } } }));
    expect(verifyProviderWebhook(raw, signature(raw), config, now)).toStrictEqual(event());
  });
  it.each([{ metadata: { purpose: "x".repeat(101) } }, { payment_status: "x".repeat(101) }])("rejects oversized snapshot strings: %j", hints => {
    const raw = JSON.stringify(event({ data: { object: { id: "cs_test_fixture", ...hints } } }));
    expect(() => verifyProviderWebhook(raw, signature(raw), config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
  });
  it("retains an unrelated purpose so the service can ignore the event before fetching", () => {
    const unrelated = event({ data: { object: { id: "cs_test_unrelated", metadata: { purpose: "another-product" } } } });
    const raw = JSON.stringify(unrelated);
    expect(verifyProviderWebhook(raw, signature(raw), config, now)).toStrictEqual(unrelated);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("accepts any matching v1 during secret rotation but never v0 alone", () => {
    const raw = JSON.stringify(event());
    const valid = sign(raw);
    const bad = "0".repeat(64);
    for (const header of [`t=${now},v1=${bad},v1=${valid}`, `v1=${valid},t=${now},v1=${bad}`, `t=${now}, v0=${bad}, v1=${valid}`]) {
      expect(verifyProviderWebhook(raw, header, config, now)).toEqual(event());
    }
    expect(() => verifyProviderWebhook(raw, `t=${now},v0=${valid}`, config, now)).toThrow();
  });
  it.each([-300, 0, 300])("accepts the inclusive freshness boundary at %i seconds", difference => {
    const raw = JSON.stringify(event());
    expect(verifyProviderWebhook(raw, signature(raw, now + difference), config, now)).toEqual(event());
  });
  it.each([-301, 301])("rejects a stale or future signature at %i seconds", difference => {
    const raw = JSON.stringify(event());
    expect(() => verifyProviderWebhook(raw, signature(raw, now + difference), config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
  });
  it("uses delivery time rather than event creation time for retries", () => {
    const oldEvent = event({ created: now - 86_400 });
    const raw = JSON.stringify(oldEvent);
    expect(verifyProviderWebhook(raw, signature(raw), config, now)).toEqual(oldEvent);
  });
  it("allows a small event-creation clock skew but rejects events more than 300 seconds in the future", () => {
    const permitted = event({ created: now + 300 });
    const permittedRaw = JSON.stringify(permitted);
    expect(verifyProviderWebhook(permittedRaw, signature(permittedRaw), config, now)).toStrictEqual(permitted);
    const futureRaw = JSON.stringify(event({ created: now + 301 }));
    expect(() => verifyProviderWebhook(futureRaw, signature(futureRaw), config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
  });
  it("defaults to the current server clock", () => {
    vi.useFakeTimers(); vi.setSystemTime(now * 1000);
    const raw = JSON.stringify(event());
    expect(verifyProviderWebhook(raw, signature(raw), config)).toEqual(event());
  });
  it.each([
    "", `t=${now}`, `v1=${"0".repeat(64)}`, `t=${now},v1=bad`, `t=${now},v1=${"0".repeat(63)}`,
    `t=${now},v1=${"g".repeat(64)}`, `t=${now},v1=${"a".repeat(64)},`, `t=${now};v1=${"a".repeat(64)}`,
    `t=${now},v1=${"a".repeat(64)}=extra`, `t=${now},garbage,v1=${"a".repeat(64)}`,
  ])("rejects a malformed signature header %s", header => {
    expect(() => verifyProviderWebhook(JSON.stringify(event()), header, config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
  });
  it("rejects duplicate timestamps, even identical ones accompanying a good signature", () => {
    const raw = JSON.stringify(event());
    for (const header of [`${signature(raw)},t=${now}`, `t=${now - 1},${signature(raw)}`, `${signature(raw)},t=${now - 1}`]) {
      expect(() => verifyProviderWebhook(raw, header, config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
    }
  });
  it("rejects control characters rather than trimming a malformed multiline header", () => {
    const raw = JSON.stringify(event());
    for (const header of [`${signature(raw)}\n`, `t=${now},\r\nv1=${sign(raw)}`, `${signature(raw)}\0`]) {
      expect(() => verifyProviderWebhook(raw, header, config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
    }
  });
  it.each([`0${now}`, `${now}.0`, `+${now}`, `${now}e0`, `${now}junk`, "9007199254740993", "-1"]) ("rejects ambiguously encoded timestamps even with a matching HMAC: %s", time => {
    const raw = JSON.stringify(event());
    expect(() => verifyProviderWebhook(raw, `t=${time},v1=${sign(raw, time)}`, config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
  });
  it("rejects wrong secrets, malformed v1 alongside valid v1, oversized headers and bodies", () => {
    const raw = JSON.stringify(event());
    for (const header of [`t=${now},v1=${sign(raw, now, "whsec_wrong")}`, `${signature(raw)},v1=bad`, `${signature(raw)},v0=${"x".repeat(8192)}`]) {
      expect(() => verifyProviderWebhook(raw, header, config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
    }
    const hugeRaw = JSON.stringify(event({ extra: "x".repeat(262_144) }));
    expect(() => verifyProviderWebhook(hugeRaw, signature(hugeRaw), config, now)).toThrow();
  });
  it.each([
    "not-json", "null", "[]", "{}", JSON.stringify(event({ id: "not-event" })), JSON.stringify(event({ type: "" })),
    JSON.stringify(event({ created: "123" })), JSON.stringify(event({ created: 0 })), JSON.stringify(event({ livemode: "false" })),
    JSON.stringify(event({ data: {} })), JSON.stringify(event({ data: { object: { id: "" } } })),
  ])("rejects a signed payload with an invalid event schema: %s", raw => {
    expect(() => verifyProviderWebhook(raw, signature(raw), config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
  });
  it("rejects a verified signature from the wrong environment", () => {
    const raw = JSON.stringify(event({ livemode: true }));
    expect(() => verifyProviderWebhook(raw, signature(raw), config, now)).toThrow(expect.objectContaining({ code: "payment_webhook" }));
    expect(verifyProviderWebhook(raw, signature(raw), { ...config, environment: "live" }, now).livemode).toBe(true);
  });
});
