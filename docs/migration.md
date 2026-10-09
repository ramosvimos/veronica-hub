# Migration

Target repository: ramosvimos/veronica-hub, based on main cd38d50f4317b6eaa20fafd57b62c9c40e1b80b2. Its canonical metadata and robots sitemap establish residentevilveronica.com as the target domain.

The owner clarified that the currently published AskPDF directory is the requested base. Source ramosvimos/askpdf-directory@87ec3457e0732c6f76d953af1446d005ec168c05 identifies askpdf.top in its README; the live site was checked in the cloud browser and matches the directory component structure, filters, 24-item pages and three-tool comparison. The older askpdf application and prior prepared anime-derived interface are not the implemented directory base.

Selected current source modules are adapted with source metadata retained. Unrelated PDF content/default privacy claims, payments, accounts, email, analytics, remote favicon fetching, service configuration and deployment integration are removed. General-tool content was re-researched; no claim is made to recover the undocumented October 3 tool records or reuse their old test results.

Free workflow storage and permissions are isolated under src/lib/submissions. Default production readiness is closed; no D1, admin secret, permissions, email, payment or domain changes were made. Any future production release needs dedicated configuration, authorization, persistent-storage checks and live verification. Current deliverable is a draft PR, not a merged or deployed site.

See archive-migration.md for all 44 preserved historical routes and original asset SHA mappings, and source-provenance.json for directory source files.
