"use client";

// Adapted from the original AskPDF details/preview submission form.
import { pdfCategories } from "@/data/pdf-catalog";
import { inputClass, type SubmissionInput } from "./submission-client";

export function inputFromForm(form: HTMLFormElement): SubmissionInput {
  const data = new FormData(form);
  return {
    submissionType: "free", name: String(data.get("name") || "").trim(), url: String(data.get("url") || "").trim(),
    email: String(data.get("email") || "").trim(), category: String(data.get("category") || ""),
    description: String(data.get("description") || "").trim(), pricing: data.get("pricing") as SubmissionInput["pricing"],
    processing: data.get("processing") as SubmissionInput["processing"], sourceUrl: String(data.get("sourceUrl") || "").trim() || undefined,
    backlinkUrl: String(data.get("backlinkUrl") || "").trim(), confirmed: (data.get("confirmed") === "on") as true,
    website: String(data.get("website") || ""),
  };
}

export function SubmissionFields({ initial, disabled = false }: { initial?: SubmissionInput; disabled?: boolean }) {
  return <fieldset disabled={disabled} className="space-y-6">
    <legend className="sr-only">Tool details</legend>
    <p className="text-sm text-muted-foreground">All fields marked * are required. Use public HTTPS URLs without sign-in details, query strings or fragments.</p>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-medium">Tool name *<input className={inputClass} name="name" defaultValue={initial?.name} required minLength={2} maxLength={80} autoComplete="organization" /></label>
      <label className="text-sm font-medium">Product website *<input className={inputClass} name="url" defaultValue={initial?.url} type="url" required maxLength={500} placeholder="https://your-product.com" /><span className="mt-2 block font-normal text-muted-foreground">One listing or submission per domain, including www variants. Use your saved token for revisions. Multiple products on a shared host are not supported.</span></label>
      <label className="text-sm font-medium">Contact email *<input className={inputClass} name="email" defaultValue={initial?.email} type="email" required maxLength={160} autoComplete="email" /><span className="mt-2 block font-normal text-muted-foreground">Private submission contact only. No email notifications or email-based recovery are configured.</span></label>
      <label className="text-sm font-medium">Category *<select className={inputClass} name="category" defaultValue={initial?.category || ""} required><option value="" disabled>Choose a category</option>{pdfCategories.map(category => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
      <label className="text-sm font-medium sm:col-span-2">Page with your Veronica Hub backlink *<input className={inputClass} name="backlinkUrl" defaultValue={initial?.backlinkUrl} type="url" required maxLength={500} placeholder="https://your-product.com/partners" /><span className="mt-2 block font-normal text-muted-foreground">Add a visible link first. Paste the public page where an editor can find it.</span></label>
      <label className="text-sm font-medium sm:col-span-2">What does your tool do? *<textarea className={inputClass} name="description" defaultValue={initial?.description} required minLength={10} maxLength={1000} rows={5} placeholder="Describe the specific task it helps with and who it is for." /><span className="mt-2 block font-normal text-muted-foreground">10–1,000 characters. Use clear, factual language.</span></label>
      <label className="text-sm font-medium">Product pricing<select className={inputClass} name="pricing" defaultValue={initial?.pricing || "Not verified"}>{["Not verified", "Free", "Freemium", "Paid", "Open source"].map(value => <option key={value}>{value}</option>)}</select><span className="mt-2 block font-normal text-muted-foreground">The product’s price. Submitting to Veronica Hub is always free.</span></label>
      <label className="text-sm font-medium">Processing / hosting<select className={inputClass} name="processing" defaultValue={initial?.processing || "Not verified"}>{["Not verified", "Not applicable", "Cloud", "Local", "Self-hosted", "Mixed"].map(value => <option key={value}>{value}</option>)}</select><span className="mt-2 block font-normal text-muted-foreground">Choose “Not verified” if you are unsure.</span></label>
      <label className="text-sm font-medium sm:col-span-2">Reference or documentation page<input className={inputClass} name="sourceUrl" defaultValue={initial?.sourceUrl} type="url" maxLength={500} placeholder="https://your-product.com/docs" /></label>
    </div>
    <div className="hidden" aria-hidden="true"><label>Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1.5 h-4 w-4 shrink-0" name="confirmed" type="checkbox" required defaultChecked={Boolean(initial?.confirmed)} /><span>I represent this tool or have permission to submit it. The information is accurate, and I will keep a visible Veronica Hub backlink on the submitted site while listed. I understand that publication requires editorial approval and is not guaranteed.</span></label>
  </fieldset>;
}

export function SubmissionSummary({ input }: { input: SubmissionInput }) {
  const rows = [
    ["Tool", input.name], ["Website", input.url], ["Contact email (private)", input.email],
    ["Category", pdfCategories.find(category => category.slug === input.category)?.name || input.category],
    ["Backlink page", input.backlinkUrl], ["Description", input.description], ["Product pricing", input.pricing],
    ["Processing / hosting", input.processing], ["Reference", input.sourceUrl || "Not supplied"],
  ];
  return <dl className="divide-y divide-border">{rows.map(([label, value]) => <div key={label} className="grid gap-1 py-3 text-sm sm:grid-cols-[11rem_1fr]"><dt className="text-muted-foreground">{label}</dt><dd className="min-w-0 whitespace-pre-wrap break-words">{value}</dd></div>)}</dl>;
}
