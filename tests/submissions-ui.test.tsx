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
