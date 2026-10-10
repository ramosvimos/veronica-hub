import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { SubmissionStatus } from "@/components/submissions/submission-status";
import { SubmissionAdmin } from "@/components/submissions/submission-admin";
import type { SubmissionRecord } from "@/components/submissions/submission-client";

const id = "9dccfa31-6a95-44d7-aea4-75e0641e2cfe";
const token = "a".repeat(64);
const adminKey = "dedicated-review-key-".repeat(3);
const input: SubmissionRecord["input"] = { submissionType: "free", name: "Toolbox", url: "https://toolbox.dev/", email: "owner@toolbox.dev", category: "development", description: "A useful developer tool for reviewing projects.", pricing: "Paid", processing: "Cloud", backlinkUrl: "https://toolbox.dev/links", confirmed: true, website: "" };
const record: SubmissionRecord = { id, status: "awaiting-backlink-review", input, version: 0, createdAt: "2026-10-09T12:00:00Z", updatedAt: "2026-10-09T12:00:00Z" };
const ready = { ready: true, mode: "local", message: "Local submission storage is ready.", adminReady: true };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock); });

async function fillSubmission() {
  fireEvent.change(screen.getByLabelText("Tool name *"), { target: { value: input.name } });
  fireEvent.change(screen.getByLabelText(/Product website/), { target: { value: input.url } });
  fireEvent.change(screen.getByLabelText(/Contact email/), { target: { value: input.email } });
  fireEvent.change(screen.getByLabelText("Category *"), { target: { value: input.category } });
  fireEvent.change(screen.getByLabelText(/Page with your Veronica Hub/), { target: { value: input.backlinkUrl } });
  fireEvent.change(screen.getByLabelText(/What does your tool do/), { target: { value: input.description } });
  fireEvent.change(screen.getByLabelText(/Product pricing/), { target: { value: input.pricing } });
  await userEvent.click(screen.getByRole("checkbox"));
}
async function openStatus(value = record) {
  fetchMock.mockResolvedValueOnce(json({ submission: value }));
  render(<SubmissionStatus />);
  fireEvent.change(screen.getByLabelText("Submission ID"), { target: { value: id } });
  fireEvent.change(screen.getByLabelText("Private management token"), { target: { value: token } });
  await userEvent.click(screen.getByRole("button", { name: "View submission" }));
  await screen.findByRole("heading", { name: input.name });
}

describe("free submission UI", () => {
  it("warns about uncertain persistence when a create response is lost", async () => {
    fetchMock.mockResolvedValueOnce(json(ready)).mockRejectedValueOnce(new TypeError("Network request failed."));
    render(<SubmissionForm />); await screen.findByText(ready.message); await fillSubmission();
    await userEvent.click(screen.getByRole("button", { name: "Review submission" }));
    await userEvent.click(screen.getByRole("button", { name: "Submit for free review" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("request may already have been saved");
    expect(screen.queryByText("Save your private access details now")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("disables submission when service is unavailable and supports readiness retry", async () => {
    fetchMock.mockResolvedValueOnce(json({ ...ready, ready: false, adminReady: false, message: "Submissions are disabled." })).mockResolvedValueOnce(json(ready));
    render(<SubmissionForm />);
    await screen.findByText("Submissions are disabled.");
    expect(screen.getByRole("button", { name: "Review submission" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Check availability again" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Review submission" })).toBeEnabled());
    expect(fetchMock.mock.calls.every(([, options]) => options.cache === "no-store")).toBe(true);
  });
  it("reviews a free payload, saves once, and requires saving before token dismissal", async () => {
    fetchMock.mockResolvedValueOnce(json(ready)).mockResolvedValueOnce(json({ submission: record, token }));
    render(<SubmissionForm />);
    await screen.findByText(ready.message);
    await fillSubmission();
    await userEvent.click(screen.getByRole("button", { name: "Review submission" }));
    expect(screen.getByRole("heading", { name: "Review your submission" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Submit for free review" }));
    await screen.findByRole("heading", { name: "Save your private access details now" });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ submissionType: "free", pricing: "Paid", confirmed: true, website: "" });
    expect(screen.getByLabelText("Private management token")).toHaveValue(token);
    expect(screen.getByRole("button", { name: "Hide the token" })).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Manage your submission" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: /securely saved/ }));
    await userEvent.click(screen.getByRole("button", { name: "Hide the token" }));
    expect(screen.queryByLabelText("Private management token")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Manage your submission" })).toHaveAttribute("href", "/submit-tool/status");
    expect(window.location.href).not.toContain(token);
  });
  it("shows a real server error and leaves the preview ready for a manual retry", async () => {
    fetchMock.mockResolvedValueOnce(json(ready)).mockResolvedValueOnce(json({ error: "This website is already listed.", code: "duplicate" }, 409));
    render(<SubmissionForm />); await screen.findByText(ready.message); await fillSubmission();
    await userEvent.click(screen.getByRole("button", { name: "Review submission" }));
    await userEvent.click(screen.getByRole("button", { name: "Submit for free review" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("already listed");
    expect(screen.getByRole("button", { name: "Submit for free review" })).toBeEnabled();
    expect(screen.queryByText("Save your private access details now")).not.toBeInTheDocument();
  });
});

describe("private submission management", () => {
  it("uses private POST access, requires withdrawal confirmation and clears the view", async () => {
    await openStatus();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/submissions/status");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ id, token });
    expect(screen.getByRole("button", { name: "Edit details" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Withdraw submission" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockResolvedValueOnce(json({ submission: { ...record, status: "withdrawn", version: 1 } }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm withdrawal" }));
    await screen.findByText("Submission withdrawn.");
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe(`Bearer ${token}`);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ action: "withdraw", version: 0 });
    expect(screen.getByRole("button", { name: "Resubmit for review" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close private view" }));
    expect(screen.getByLabelText("Private management token")).toHaveValue("");
    expect(screen.getByLabelText("Submission ID")).toHaveValue("");
  });
  it("refreshes after a version conflict and prevents stale edits to approved listings", async () => {
    await openStatus();
    fetchMock.mockResolvedValueOnce(json({ error: "Submission changed.", code: "conflict" }, 409)).mockResolvedValueOnce(json({ submission: { ...record, status: "approved", version: 2, listingSlug: "submission-" + id } }));
    await userEvent.click(screen.getByRole("button", { name: "Edit details" }));
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Latest status loaded");
    expect(fetchMock.mock.calls[2][0]).toBe("/api/submissions/status");
    expect(screen.queryByRole("button", { name: "Edit details" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View directory listing" })).toHaveAttribute("href", "/item/submission-" + id);
  });
  it("resubmits rejected records with the latest version and no credential in the URL", async () => {
    await openStatus({ ...record, status: "rejected", version: 4, reviewNote: "Please clarify your product description." });
    fetchMock.mockResolvedValueOnce(json({ submission: { ...record, version: 5 } }));
    await userEvent.click(screen.getByRole("button", { name: "Resubmit for review" }));
    await screen.findByText(/returned to the editorial review queue/);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ action: "resubmit", version: 4 });
    expect(fetchMock.mock.calls[1][0]).not.toContain(token);
  });
});

describe("manual editorial review", () => {
  it("does not unlock admin when a key is configured but storage is disabled", async () => {
    fetchMock.mockResolvedValueOnce(json({ ...ready, ready: false, adminReady: true, mode: "disabled" }));
    render(<SubmissionAdmin />);
    await screen.findByText(/Editorial review is unavailable/);
    expect(screen.getByRole("button", { name: "Load submissions" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Check availability again" })).toBeInTheDocument();
  });
  it("requires an editorial note and explicit confirmation for admin withdrawal", async () => {
    const approved: SubmissionRecord = { ...record, status: "approved", version: 4, listingSlug: "submission-" + id };
    fetchMock.mockResolvedValueOnce(json(ready)).mockResolvedValueOnce(json({ submissions: [approved] })).mockResolvedValueOnce(json({ submission: { ...approved, status: "withdrawn", version: 5, reviewNote: "The required backlink has been removed.", listingSlug: undefined } }));
    render(<SubmissionAdmin />); await screen.findByText("Editorial review is available.");
    fireEvent.change(screen.getByLabelText("Dedicated admin key"), { target: { value: adminKey } });
    await userEvent.click(screen.getByRole("button", { name: "Load submissions" }));
    await screen.findByRole("heading", { name: input.name });
    fireEvent.change(screen.getByLabelText(/Withdrawal note/), { target: { value: "The required backlink has been removed." } });
    await userEvent.click(screen.getByRole("button", { name: "Withdraw published listing" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await userEvent.click(screen.getByRole("button", { name: "Confirm withdrawal" }));
    await screen.findByText(/Listing withdrawn from the public directory/);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({ action: "review", decision: "withdraw", version: 4, note: "The required backlink has been removed." });
    expect(screen.queryByRole("link", { name: "View published listing" })).not.toBeInTheDocument();
  });

  it("requires saved checks, uses the dedicated key header and clears credentials when locked", async () => {
    const verified: SubmissionRecord = { ...record, version: 1, status: "free-awaiting-review", websiteVerifiedAt: record.createdAt, backlinkVerifiedAt: record.createdAt, verificationNote: "Website and visible backlink checked." };
    fetchMock.mockResolvedValueOnce(json(ready)).mockResolvedValueOnce(json({ submissions: [record] })).mockResolvedValueOnce(json({ submission: verified })).mockResolvedValueOnce(json({ submission: { ...verified, status: "approved", version: 2 } }));
    render(<SubmissionAdmin />); await screen.findByText("Editorial review is available.");
    fireEvent.change(screen.getByLabelText("Dedicated admin key"), { target: { value: adminKey } });
    await userEvent.click(screen.getByRole("button", { name: "Load submissions" }));
    await screen.findByRole("heading", { name: input.name });
    expect(screen.getByRole("button", { name: "Approve & publish" })).toBeDisabled();
    await userEvent.click(screen.getByRole("checkbox", { name: /opened the official website/ }));
    await userEvent.click(screen.getByRole("checkbox", { name: /opened the backlink page/ }));
    fireEvent.change(screen.getByLabelText(/Review note/), { target: { value: "Website and visible backlink checked." } });
    await userEvent.click(screen.getByRole("button", { name: "Save manual verification" }));
    await screen.findByText("Manual website and backlink checks saved. This submission still needs an approval decision.");
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({ action: "review", decision: "verify", websiteChecked: true, backlinkChecked: true, version: 0 });
    expect(screen.getByRole("button", { name: "Approve & publish" })).toBeEnabled();
    fireEvent.change(screen.getByLabelText(/Review note/), { target: { value: "Useful product and accurate description approved." } });
    await userEvent.click(screen.getByRole("button", { name: "Approve & publish" }));
    await screen.findByText("Submission approved and published.");
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe(`Bearer ${adminKey}`);
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toMatchObject({ action: "review", decision: "approve", version: 1 });
    await userEvent.click(screen.getByRole("button", { name: "Lock review session" }));
    expect(screen.getByLabelText("Dedicated admin key")).toHaveValue("");
    expect(screen.queryByRole("heading", { name: input.name })).not.toBeInTheDocument();
  });
});

const paidInput: SubmissionRecord["input"] = { ...input, submissionType: "paid", pricing: "Free", backlinkUrl: "" };
const paidRecord: SubmissionRecord = { ...record, input: paidInput, serviceType: "paid", status: "awaiting-payment", payment: { status: "awaiting-payment", checkoutStarted: false, refundStatus: "none" } };
const paidReady = { ...ready, paidReady: true, paidMessage: "Paid submissions are available." };
const confirmedPaid: SubmissionRecord = { ...paidRecord, status: "paid-awaiting-review", version: 2, payment: { status: "paid", checkoutStarted: true, paidAt: "2026-10-09T12:00:00Z", reviewDueAt: "2026-10-20T12:00:00Z", refundStatus: "none" } };

async function fillPaidSubmission() {
  await userEvent.click(screen.getByRole("radio", { name: /Paid · USD 9.90/ }));
  fireEvent.change(screen.getByLabelText("Tool name *"), { target: { value: paidInput.name } });
  fireEvent.change(screen.getByLabelText(/Product website/), { target: { value: paidInput.url } });
  fireEvent.change(screen.getByLabelText(/Contact email/), { target: { value: paidInput.email } });
  fireEvent.change(screen.getByLabelText("Category *"), { target: { value: paidInput.category } });
  fireEvent.change(screen.getByLabelText(/What does your tool do/), { target: { value: paidInput.description } });
  fireEvent.change(screen.getByLabelText(/Product pricing/), { target: { value: paidInput.pricing } });
  await userEvent.click(screen.getByRole("checkbox", { name: /I represent this tool/ }));
}
async function openAdmin(value: SubmissionRecord) {
  fetchMock.mockResolvedValueOnce(json(ready)).mockResolvedValueOnce(json({ submissions: [value] }));
  render(<SubmissionAdmin />);
  await screen.findByText("Editorial review is available.");
  fireEvent.change(screen.getByLabelText("Dedicated admin key"), { target: { value: adminKey } });
  await userEvent.click(screen.getByRole("button", { name: "Load submissions" }));
  await screen.findByRole("heading", { name: input.name });
}

describe("paid submission UI", () => {
  it("keeps paid intake closed without explicit readiness while preserving free intake", async () => {
    fetchMock.mockResolvedValueOnce(json(ready));
    render(<SubmissionForm />);
    await screen.findByText(ready.message);
    expect(screen.getByRole("radio", { name: /Paid · USD 9.90/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /Free · \$0/ })).toBeChecked();
    expect(screen.getByRole("button", { name: "Review submission" })).toBeEnabled();
  });

  it("separates paid submission from product pricing and saves credentials before checkout", async () => {
    const storage = vi.spyOn(Storage.prototype, "setItem");
    fetchMock.mockResolvedValueOnce(json(paidReady)).mockResolvedValueOnce(json({ submission: paidRecord, token })).mockResolvedValueOnce(json(paidReady)).mockResolvedValueOnce(json({ submission: { ...paidRecord, version: 1, payment: { ...paidRecord.payment, checkoutStarted: true } }, checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_example" }));
    render(<SubmissionForm />);
    await screen.findByText(ready.message);
    await fillPaidSubmission();
    expect(screen.queryByLabelText(/Page with your Veronica Hub/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read the submission terms" })).toHaveAttribute("href", "/terms");
    await userEvent.click(screen.getByRole("button", { name: "Review submission" }));
    expect(screen.getByText("USD 9.90 once")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Save paid submission" }));
    await screen.findByRole("heading", { name: "Save your private access details now" });
    await screen.findByText(paidReady.paidMessage);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ submissionType: "paid", pricing: "Free", backlinkUrl: "", confirmed: true });
    expect(screen.getByRole("button", { name: "Prepare secure checkout" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    await userEvent.click(screen.getByRole("checkbox", { name: /securely saved both/ }));
    await userEvent.click(screen.getByRole("button", { name: "Hide the token" }));
    await userEvent.click(screen.getByRole("button", { name: "Prepare secure checkout" }));
    const link = await screen.findByRole("link", { name: "Continue to secure checkout · USD 9.90" });
    expect(link).toHaveAttribute("href", "https://checkout.stripe.com/c/pay/cs_test_example");
    expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(fetchMock.mock.calls[3][0]).toBe("/api/submissions/checkout");
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ id });
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe(`Bearer ${token}`);
    expect(screen.queryByLabelText("Private management token")).not.toBeInTheDocument();
    expect(storage).not.toHaveBeenCalled();
    storage.mockRestore();
  });

  it("does not enable checkout if paid availability closes after creation", async () => {
    fetchMock.mockResolvedValueOnce(json(paidReady)).mockResolvedValueOnce(json({ submission: paidRecord, token })).mockResolvedValueOnce(json({ ...ready, paidReady: false, paidMessage: "Paid checkout is closed for maintenance." }));
    render(<SubmissionForm />); await screen.findByText(ready.message); await fillPaidSubmission();
    await userEvent.click(screen.getByRole("button", { name: "Review submission" }));
    await userEvent.click(screen.getByRole("button", { name: "Save paid submission" }));
    await screen.findByText("Paid checkout is closed for maintenance.");
    await userEvent.click(screen.getByRole("checkbox", { name: /securely saved both/ }));
    expect(screen.getByRole("button", { name: "Prepare secure checkout" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Check checkout availability again" })).toBeInTheDocument();
  });

  it("ignores checkout success parameters and shows payment pending until server confirmation", async () => {
    window.history.replaceState(null, "", "/submit-tool/status?payment=success&session_id=cs_test_forged");
    fetchMock.mockResolvedValueOnce(json({ submission: paidRecord })).mockResolvedValueOnce(json({ ...ready, paidReady: false }));
    render(<SubmissionStatus />);
    fireEvent.change(screen.getByLabelText("Submission ID"), { target: { value: id } });
    fireEvent.change(screen.getByLabelText("Private management token"), { target: { value: token } });
    await userEvent.click(screen.getByRole("button", { name: "View submission" }));
    await screen.findByRole("heading", { name: input.name });
    expect(screen.getByText(/Not yet confirmed by the server/)).toBeInTheDocument();
    expect(screen.queryByText(/Confirmed by the server on/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Review due by/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prepare secure checkout" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit details" })).toBeInTheDocument();
    window.history.replaceState(null, "", "/");
  });

  it("uses server-confirmed deadlines and preserves terminal paid refund status", async () => {
    await openStatus(confirmedPaid);
    expect(screen.getByText(/Review due by/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit details" })).not.toBeInTheDocument();
    fetchMock.mockResolvedValueOnce(json({ submission: { ...confirmedPaid, status: "rejected", version: 3, payment: { ...confirmedPaid.payment, refundStatus: "pending" } } }));
    await userEvent.click(screen.getByRole("button", { name: "Refresh status" }));
    await screen.findByText(/Full refund pending/);
    expect(screen.queryByRole("button", { name: "Resubmit for review" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit details" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Full refund verified/)).not.toBeInTheDocument();
  });

  it("never labels a refund complete without a server verification timestamp", async () => {
    await openStatus({ ...confirmedPaid, status: "rejected", payment: { ...confirmedPaid.payment!, refundStatus: "refunded" } });
    expect(screen.getByText(/Full refund pending/)).toBeInTheDocument();
    expect(screen.queryByText(/Full refund verified/)).not.toBeInTheDocument();
  });
});

describe("paid editorial and refund review", () => {
  it("requires the website check for paid submissions without requiring a backlink", async () => {
    await openAdmin(confirmedPaid);
    expect(screen.queryByRole("checkbox", { name: /opened the backlink page/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open backlink page/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve & publish" })).toBeDisabled();
    const verified = { ...confirmedPaid, websiteVerifiedAt: record.createdAt, version: 3 };
    fetchMock.mockResolvedValueOnce(json({ submission: verified }));
    await userEvent.click(screen.getByRole("checkbox", { name: /opened the official website/ }));
    fireEvent.change(screen.getByLabelText(/Review note/), { target: { value: "Official website and product identity verified." } });
    await userEvent.click(screen.getByRole("button", { name: "Save manual verification" }));
    await screen.findByText("Manual website check saved. This paid submission still needs an approval decision.");
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({ decision: "verify", websiteChecked: true, backlinkChecked: false });
    expect(screen.getByRole("button", { name: "Approve & publish" })).toBeEnabled();
    expect(screen.getByText(/Rejecting this paid submission creates a full USD 9.90 refund obligation/)).toBeInTheDocument();
  });

  it("keeps paid review unavailable while payment is unconfirmed", async () => {
    await openAdmin(paidRecord);
    expect(screen.queryByRole("button", { name: "Approve & publish" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject submission" })).not.toBeInTheDocument();
    expect(screen.getByText(/Editorial decisions are unavailable until the server confirms payment/)).toBeInTheDocument();
  });

  it("verifies a completed provider refund and keeps failed verification pending", async () => {
    const rejected: SubmissionRecord = { ...confirmedPaid, status: "rejected", version: 4, payment: { ...confirmedPaid.payment!, refundStatus: "pending" } };
    await openAdmin(rejected);
    expect(screen.queryByRole("button", { name: /mark.*refund/i })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Provider refund ID"), { target: { value: "re_example123" } });
    fetchMock.mockResolvedValueOnce(json({ error: "This provider refund is not a completed full refund for this payment." }, 400));
    await userEvent.click(screen.getByRole("button", { name: "Verify completed provider refund" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("not a completed full refund");
    expect(screen.getByText(/Full refund pending/)).toBeInTheDocument();
    expect(screen.queryByText(/Full refund verified/)).not.toBeInTheDocument();
    fetchMock.mockResolvedValueOnce(json({ submission: { ...rejected, version: 5, payment: { ...rejected.payment, refundStatus: "refunded", refundVerifiedAt: "2026-10-10T10:00:00Z" } } }));
    await userEvent.click(screen.getByRole("button", { name: "Verify completed provider refund" }));
    await screen.findByText("Full USD 9.90 refund verified against the payment provider’s completed refund record.");
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ action: "verify-refund", id, version: 4, refundId: "re_example123" });
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe(`Bearer ${adminKey}`);
    expect(screen.queryByLabelText("Provider refund ID")).not.toBeInTheDocument();
  });
});

describe("paid interruption safeguards", () => {
  it("requires a note and confirmation when an editor withdraws an unpaid application", async () => {
    await openAdmin({ ...paidRecord, payment: { ...paidRecord.payment!, checkoutStarted: true } });
    await userEvent.click(screen.getByRole("button", { name: "Withdraw unpaid application" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/This does not cancel an open payment checkout/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Confirm withdrawal" }));
    expect(screen.getByRole("alert")).toHaveTextContent("note of at least 10 characters");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fireEvent.change(screen.getByLabelText(/Withdrawal note/), { target: { value: "Unpaid application withdrawn after manual review." } });
    fetchMock.mockResolvedValueOnce(json({ submission: { ...paidRecord, status: "withdrawn", version: 1 } }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm withdrawal" }));
    await screen.findByText(/Unpaid application withdrawn. An open checkout is not canceled/);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({ action: "review", decision: "withdraw", version: 0 });
  });

  it("locks other private actions during checkout preparation and releases them afterward", async () => {
    fetchMock.mockResolvedValueOnce(json({ submission: paidRecord })).mockResolvedValueOnce(json(paidReady));
    render(<SubmissionStatus />);
    fireEvent.change(screen.getByLabelText("Submission ID"), { target: { value: id } });
    fireEvent.change(screen.getByLabelText("Private management token"), { target: { value: token } });
    await userEvent.click(screen.getByRole("button", { name: "View submission" }));
    await screen.findByText(paidReady.paidMessage);
    await userEvent.click(screen.getByRole("checkbox", { name: /securely saved my submission ID/ }));
    let complete!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>(resolve => { complete = resolve; }));
    await userEvent.click(screen.getByRole("button", { name: "Prepare secure checkout" }));
    expect(screen.getByRole("button", { name: "Close private view" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Withdraw submission" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit details" })).toBeDisabled();
    complete(json({ submission: { ...paidRecord, version: 1, payment: { ...paidRecord.payment, checkoutStarted: true } }, checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_safe" }));
    await screen.findByRole("link", { name: "Continue to secure checkout · USD 9.90" });
    expect(screen.getByRole("button", { name: "Close private view" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Edit details" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close private view" }));
    expect(screen.getByLabelText("Private management token")).toHaveValue("");
    expect(screen.queryByRole("link", { name: "Continue to secure checkout · USD 9.90" })).not.toBeInTheDocument();
  });
});

describe("checkout reconciliation", () => {
  it("shows a server-confirmed payment if checkout reconciliation returns no new payment link", async () => {
    fetchMock.mockResolvedValueOnce(json({ submission: paidRecord })).mockResolvedValueOnce(json(paidReady));
    render(<SubmissionStatus />);
    fireEvent.change(screen.getByLabelText("Submission ID"), { target: { value: id } });
    fireEvent.change(screen.getByLabelText("Private management token"), { target: { value: token } });
    await userEvent.click(screen.getByRole("button", { name: "View submission" }));
    await screen.findByText(paidReady.paidMessage);
    await userEvent.click(screen.getByRole("checkbox", { name: /securely saved my submission ID/ }));
    fetchMock.mockResolvedValueOnce(json({ submission: confirmedPaid, checkoutUrl: null }));
    await userEvent.click(screen.getByRole("button", { name: "Prepare secure checkout" }));
    await screen.findByText(/Confirmed by the server on/);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Prepare secure checkout" })).not.toBeInTheDocument();
    expect(screen.getByText(/Review due by/)).toBeInTheDocument();
  });
});

describe("submission service consent", () => {
  it("requires new paid consent after changing from a confirmed free application", async () => {
    fetchMock.mockResolvedValueOnce(json(paidReady));
    render(<SubmissionForm />); await screen.findByText(ready.message);
    await fillSubmission();
    expect(screen.getByRole("checkbox", { name: /I represent this tool/ })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: /Paid · USD 9.90/ }));
    expect(screen.getByRole("checkbox", { name: /I represent this tool/ })).not.toBeChecked();
    expect(screen.getByLabelText("Tool name *")).toHaveValue(input.name);
    expect(screen.getByRole("checkbox", { name: /one-time USD 9.90 submission fee/ })).toBeRequired();
  });
});
