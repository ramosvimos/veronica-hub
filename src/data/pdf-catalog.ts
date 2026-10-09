export type PdfTool = {
  slug: string;
  name: string;
  initials: string;
  iconUrl?: string;
  websiteDomain?: string;
  description: string;
  categories: string[];
  pricing: "Free" | "Freemium" | "Paid" | "Open source" | "Not verified";
  processing: "Cloud" | "Local" | "Self-hosted" | "Mixed" | "Not applicable" | "Not verified";
  platform: string;
  registration: string;
  freeLimits: string;
  bestFor: string;
  limitation: string;
  features: string[];
  coreTools?: string[];
  pros?: string[];
  cons?: string[];
  supportedFormats?: string[];
  privacyNotes?: string;
  developerOrCompany?: string;
  url: string;
  sources: { label: string; url: string }[];
  featured?: boolean;
  paidSubmission?: boolean;
  reciprocalSubmission?: boolean;
  reviewedOn?: string;
  evidenceStatus?: "reviewed" | "needs-review";
  sourceLinkUnavailable?: boolean;
  searchKeywords?: string[];
};

export const catalogReviewedOn = "2026-10-09";
export const pdfCategories = [
 {slug:"ai",name:"AI assistants",shortName:"AI",description:"Writing, research and AI-assisted work.",icon:"reading"},
 {slug:"productivity",name:"Work & organize",shortName:"Productivity",description:"Notes, projects and everyday organization.",icon:"edit"},
 {slug:"development",name:"Build & develop",shortName:"Development",description:"Code, APIs and developer workflows.",icon:"code"},
 {slug:"design",name:"Design & create",shortName:"Design",description:"Visual design and creative work.",icon:"sign"},
 {slug:"other",name:"Other tools",shortName:"Other",description:"Useful tools for other clearly described tasks.",icon:"other"},
] as const;
export const pdfTools: PdfTool[] = [
  {
    "slug": "chatgpt",
    "name": "ChatGPT",
    "initials": "C",
    "websiteDomain": "chatgpt.com",
    "description": "Chat with AI, research the web, work with uploaded files, and create images.",
    "categories": [
      "ai"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Chat with AI, research the web, work with uploaded files, and create images.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "assistant",
      "research",
      "images"
    ],
    "url": "https://chatgpt.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://chatgpt.com/"
      }
    ],
    "featured": true,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "assistant",
      "research",
      "images"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "claude",
    "name": "Claude",
    "initials": "C",
    "websiteDomain": "claude.com",
    "description": "Use an AI assistant to draft documents, analyze information, and build prototypes.",
    "categories": [
      "ai"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Use an AI assistant to draft documents, analyze information, and build prototypes.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "assistant",
      "writing",
      "analysis"
    ],
    "url": "https://claude.com/product/overview",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://claude.com/product/overview"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "assistant",
      "writing",
      "analysis"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "gemini",
    "name": "Google Gemini",
    "initials": "GG",
    "websiteDomain": "gemini.google.com",
    "description": "Draft writing, summarize documents, brainstorm ideas, and get help with coding or learning.",
    "categories": [
      "ai"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Draft writing, summarize documents, brainstorm ideas, and get help with coding or learning.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "assistant",
      "learning",
      "writing"
    ],
    "url": "https://gemini.google.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://gemini.google/overview/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "assistant",
      "learning",
      "writing"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "perplexity",
    "name": "Perplexity",
    "initials": "P",
    "websiteDomain": "perplexity.ai",
    "description": "Search the web with AI-generated answers and linked sources for further reading.",
    "categories": [
      "ai"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Search the web with AI-generated answers and linked sources for further reading.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "search",
      "research",
      "citations"
    ],
    "url": "https://www.perplexity.ai/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://www.perplexity.ai/en-GB/hub/products/search"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "search",
      "research",
      "citations"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "gemini-notebook",
    "name": "Gemini Notebook",
    "initials": "GN",
    "websiteDomain": "notebook.google",
    "description": "Ask questions and generate summaries grounded in documents, websites, and other sources you add.",
    "categories": [
      "ai"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Ask questions and generate summaries grounded in documents, websites, and other sources you add.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "research",
      "documents",
      "summaries"
    ],
    "url": "https://notebook.google/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://support.google.com/gemininotebook/answer/16215270?hl=en"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "research",
      "documents",
      "summaries"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "hugging-face",
    "name": "Hugging Face",
    "initials": "HF",
    "websiteDomain": "huggingface.co",
    "description": "Discover, share, and collaborate on machine-learning models, datasets, and AI applications.",
    "categories": [
      "ai"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Discover, share, and collaborate on machine-learning models, datasets, and AI applications.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "models",
      "datasets",
      "machine learning"
    ],
    "url": "https://huggingface.co/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://huggingface.co/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "models",
      "datasets",
      "machine-learning"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "deepl",
    "name": "DeepL",
    "initials": "D",
    "websiteDomain": "deepl.com",
    "description": "Translate text and documents, adapt writing, and add translation to applications through an API.",
    "categories": [
      "ai"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Translate text and documents, adapt writing, and add translation to applications through an API.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "translation",
      "writing",
      "languages"
    ],
    "url": "https://www.deepl.com/en",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://www.deepl.com/en"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "translation",
      "writing",
      "languages"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "elevenlabs",
    "name": "ElevenLabs",
    "initials": "E",
    "websiteDomain": "elevenlabs.io",
    "description": "Generate speech from text, transcribe audio, and create multilingual voice content.",
    "categories": [
      "ai"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Generate speech from text, transcribe audio, and create multilingual voice content.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "audio",
      "text to speech",
      "transcription"
    ],
    "url": "https://elevenlabs.io/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://elevenlabs.io/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "audio",
      "text-to-speech",
      "transcription"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "notion",
    "name": "Notion",
    "initials": "N",
    "websiteDomain": "notion.com",
    "description": "Keep team documents, wikis, projects, and tasks together in a connected workspace.",
    "categories": [
      "productivity"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Keep team documents, wikis, projects, and tasks together in a connected workspace.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "workspace",
      "documents",
      "projects"
    ],
    "url": "https://www.notion.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://www.notion.com/help/guides/connected-workspace-for-product-teams-to-collaborate-ideate-and-launch"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "workspace",
      "documents",
      "projects"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "obsidian",
    "name": "Obsidian",
    "initials": "O",
    "websiteDomain": "obsidian.md",
    "description": "Write local Markdown notes and connect them into a personal knowledge base.",
    "categories": [
      "productivity"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Write local Markdown notes and connect them into a personal knowledge base.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "notes",
      "markdown",
      "knowledge management"
    ],
    "url": "https://obsidian.md/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://obsidian.md/"
      }
    ],
    "featured": true,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "notes",
      "markdown",
      "knowledge-management"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "todoist",
    "name": "Todoist",
    "initials": "T",
    "websiteDomain": "todoist.com",
    "description": "Capture tasks, organize projects, and plan work with due dates and recurring reminders.",
    "categories": [
      "productivity"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Capture tasks, organize projects, and plan work with due dates and recurring reminders.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "tasks",
      "planning",
      "projects"
    ],
    "url": "https://www.todoist.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://www.todoist.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "tasks",
      "planning",
      "projects"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "linear",
    "name": "Linear",
    "initials": "L",
    "websiteDomain": "linear.app",
    "description": "Track issues, plan projects, and coordinate product-development work across a team.",
    "categories": [
      "productivity"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Track issues, plan projects, and coordinate product-development work across a team.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "issue tracking",
      "product",
      "teamwork"
    ],
    "url": "https://linear.app/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://linear.app/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "issue-tracking",
      "product",
      "teamwork"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "raycast",
    "name": "Raycast",
    "initials": "R",
    "websiteDomain": "raycast.com",
    "description": "Launch tools, find files, reuse clipboard history, and run extensions from a keyboard-driven interface.",
    "categories": [
      "productivity"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Launch tools, find files, reuse clipboard history, and run extensions from a keyboard-driven interface.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "launcher",
      "shortcuts",
      "extensions"
    ],
    "url": "https://www.raycast.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://www.raycast.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "launcher",
      "shortcuts",
      "extensions"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "zapier",
    "name": "Zapier",
    "initials": "Z",
    "websiteDomain": "zapier.com",
    "description": "Connect apps and automate workflows that move information or trigger actions across services.",
    "categories": [
      "productivity"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Connect apps and automate workflows that move information or trigger actions across services.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "automation",
      "integrations",
      "workflows"
    ],
    "url": "https://zapier.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://zapier.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "automation",
      "integrations",
      "workflows"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "calendly",
    "name": "Calendly",
    "initials": "C",
    "websiteDomain": "calendly.com",
    "description": "Share available meeting times, accept bookings, and automate scheduling reminders.",
    "categories": [
      "productivity"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Share available meeting times, accept bookings, and automate scheduling reminders.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "scheduling",
      "meetings",
      "calendar"
    ],
    "url": "https://calendly.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://calendly.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "scheduling",
      "meetings",
      "calendar"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "airtable",
    "name": "Airtable",
    "initials": "A",
    "websiteDomain": "airtable.com",
    "description": "Build custom business apps with structured data, configurable interfaces, and workflow automation.",
    "categories": [
      "productivity"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Build custom business apps with structured data, configurable interfaces, and workflow automation.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "no code",
      "data",
      "automation"
    ],
    "url": "https://www.airtable.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://www.airtable.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "no-code",
      "data",
      "automation"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "cursor",
    "name": "Cursor",
    "initials": "C",
    "websiteDomain": "cursor.com",
    "description": "Use AI coding agents to plan changes, edit code, and work through software-development tasks.",
    "categories": [
      "development"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Use AI coding agents to plan changes, edit code, and work through software-development tasks.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "ai coding",
      "editor",
      "agents"
    ],
    "url": "https://cursor.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://cursor.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "ai-coding",
      "editor",
      "agents"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "github-copilot",
    "name": "GitHub Copilot",
    "initials": "GC",
    "websiteDomain": "github.com",
    "description": "Get code suggestions, coding chat assistance, and explanations within editors and GitHub.",
    "categories": [
      "development"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Get code suggestions, coding chat assistance, and explanations within editors and GitHub.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "ai coding",
      "code completion",
      "github"
    ],
    "url": "https://github.com/features/copilot",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://github.com/features/copilot"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "ai-coding",
      "code-completion",
      "github"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "vscode",
    "name": "Visual Studio Code",
    "initials": "VS",
    "websiteDomain": "code.visualstudio.com",
    "description": "Edit and debug code with extensions, integrated terminals, source control, and AI-agent support.",
    "categories": [
      "development"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Edit and debug code with extensions, integrated terminals, source control, and AI-agent support.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "editor",
      "debugging",
      "extensions"
    ],
    "url": "https://code.visualstudio.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://code.visualstudio.com/docs"
      }
    ],
    "featured": true,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "editor",
      "debugging",
      "extensions"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "postman",
    "name": "Postman",
    "initials": "P",
    "websiteDomain": "postman.com",
    "description": "Work with APIs using request collections, automated tests, mock servers, and endpoint monitoring.",
    "categories": [
      "development"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Work with APIs using request collections, automated tests, mock servers, and endpoint monitoring.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "api",
      "testing",
      "monitoring"
    ],
    "url": "https://www.postman.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://www.postman.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "api",
      "testing",
      "monitoring"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "supabase",
    "name": "Supabase",
    "initials": "S",
    "websiteDomain": "supabase.com",
    "description": "Build application backends with Postgres, authentication, storage, APIs, and realtime data.",
    "categories": [
      "development"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Build application backends with Postgres, authentication, storage, APIs, and realtime data.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "backend",
      "postgres",
      "database"
    ],
    "url": "https://supabase.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://supabase.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "backend",
      "postgres",
      "database"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "vercel",
    "name": "Vercel",
    "initials": "V",
    "websiteDomain": "vercel.com",
    "description": "Deploy web applications and AI services with managed hosting, deployment environments, and serverless functions.",
    "categories": [
      "development"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Deploy web applications and AI services with managed hosting, deployment environments, and serverless functions.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "deployment",
      "hosting",
      "web"
    ],
    "url": "https://vercel.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://vercel.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "deployment",
      "hosting",
      "web"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "replit",
    "name": "Replit",
    "initials": "R",
    "websiteDomain": "replit.com",
    "description": "Build and publish applications with AI assistance and integrated database, authentication, and hosting services.",
    "categories": [
      "development"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Build and publish applications with AI assistance and integrated database, authentication, and hosting services.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "app builder",
      "ai coding",
      "hosting"
    ],
    "url": "https://replit.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://replit.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "app-builder",
      "ai-coding",
      "hosting"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  },
  {
    "slug": "docker",
    "name": "Docker",
    "initials": "D",
    "websiteDomain": "docker.com",
    "description": "Develop and run applications in containers, with tools for local development and isolated execution.",
    "categories": [
      "development"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Current free allowances and pricing have not been checked for this listing. See the official website.",
    "bestFor": "Develop and run applications in containers, with tools for local development and isolated execution.",
    "limitation": "Evaluate the specific feature, current plan and privacy terms against your task before using it.",
    "features": [
      "containers",
      "devops",
      "local development"
    ],
    "url": "https://www.docker.com/",
    "sources": [
      {
        "label": "Official product information",
        "url": "https://www.docker.com/"
      }
    ],
    "featured": false,
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "searchKeywords": [
      "containers",
      "devops",
      "local-development"
    ],
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider\u2019s current privacy documentation before sharing private data."
  }
];
export const pdfCollections = [
  {
    "slug": "research-and-writing",
    "name": "Research and writing",
    "description": "AI assistants and source-based research tools to evaluate for your next writing task.",
    "slugs": [
      "chatgpt",
      "claude",
      "perplexity",
      "gemini-notebook"
    ],
    "takeaway": "Start with a non-sensitive question. Check sources and factual claims yourself; an AI answer is not evidence."
  },
  {
    "slug": "organize-your-work",
    "name": "Organize your work",
    "description": "Different approaches to notes, tasks and structured project information.",
    "slugs": [
      "obsidian",
      "notion",
      "todoist",
      "airtable"
    ],
    "takeaway": "Choose around the information you manage: personal linked notes, shared documents, task lists or structured records. Check export and collaboration requirements before committing."
  }
];
export function getPdfTool(slug:string){return pdfTools.find(tool=>tool.slug===slug);}
export function getPdfCategory(slug:string){return pdfCategories.find(category=>category.slug===slug);}
export function getPdfCollection(slug:string){return pdfCollections.find(collection=>collection.slug===slug);}
export type DirectoryParams = { [key: string]: string | string[] | undefined };
export function paramValue(params: DirectoryParams | undefined, name: string) {
  const value = params?.[name];
  return typeof value === "string" ? value : "";
}
export function filterPdfTools(tools: PdfTool[], params?: DirectoryParams) {
  const query = paramValue(params, "q").trim().toLowerCase();
  const category = paramValue(params, "category");
  const price = paramValue(params, "price");
  const processing = paramValue(params, "processing");
  const sort = paramValue(params, "sort");
  const result = tools.filter((tool) => (!category || tool.categories.includes(category)) && (!price || (price === "free" ? ["Free", "Open source"].includes(tool.pricing) : tool.pricing === price)) && (!processing || tool.processing === processing) && (!query || [tool.name, tool.description, tool.bestFor, tool.platform, ...tool.features, ...(tool.searchKeywords || [])].join(" ").toLowerCase().includes(query)));
  return result.sort(sort === "name" ? (a, b) => a.name.localeCompare(b.name) : (a, b) => Number(!!b.featured) - Number(!!a.featured));
}
