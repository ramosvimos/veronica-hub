export type PdfTool = {
  slug: string;
  name: string;
  initials: string;
  iconUrl?: string;
  websiteDomain?: string;
  description: string;
  categories: string[];
  pricing: "Free" | "Freemium" | "Paid" | "Open source" | "Not verified";
  pricingEvidence?: { checkedOn: string; url: string; note: string; freeAccess: "free-plan" | "free-product" | "trial-only" | "none" | "unverified" };
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
  ownedProject?: boolean;
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free plan alongside Go, Plus, Pro and business subscriptions. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://chatgpt.com/pricing/"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://chatgpt.com/pricing/",
      "note": "Free plan alongside Go, Plus, Pro and business subscriptions. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free plan for everyone alongside paid plans. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://claude.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://claude.com/pricing",
      "note": "Free plan for everyone alongside paid plans. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free access and paid Google AI upgrades; availability varies by region. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://gemini.google/subscriptions/"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://gemini.google/subscriptions/",
      "note": "Free access and paid Google AI upgrades; availability varies by region. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Official plan guide distinguishes Free, Pro and Max. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you",
      "note": "Official plan guide distinguishes Free, Pro and Max. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Standard is free; higher limits through Google AI Plus, Pro, Ultra or qualifying paid plans. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://support.google.com/gemininotebook/answer/16213268?hl=en"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://support.google.com/gemininotebook/answer/16213268?hl=en",
      "note": "Standard is free; higher limits through Google AI Plus, Pro, Ultra or qualifying paid plans. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free community features and basic Spaces compute alongside PRO and paid compute. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://huggingface.co/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://huggingface.co/pricing",
      "note": "Free community features and basic Spaces compute alongside PRO and paid compute. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free version alongside Individual, Team, Business and Enterprise. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://www.deepl.com/en/pro"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.deepl.com/en/pro",
      "note": "Free version alongside Individual, Team, Business and Enterprise. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Recurring Free credits and paid tiers. Commercial-license rights differ by tier. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://elevenlabs.io/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://elevenlabs.io/pricing",
      "note": "Recurring Free credits and paid tiers. Commercial-license rights differ by tier. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free workspace and paid Plus/Business/Enterprise. AI in Free/Plus is a limited trial. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://www.notion.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.notion.com/pricing",
      "note": "Free workspace and paid Plus/Business/Enterprise. AI in Free/Plus is a limited trial. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Core app free without limits; optional paid Sync and Publish services. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://obsidian.md/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://obsidian.md/pricing",
      "note": "Core app free without limits; optional paid Sync and Publish services. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free Beginner plan and paid Pro/Business. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://www.todoist.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.todoist.com/pricing",
      "note": "Free Beginner plan and paid Pro/Business. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free plan and paid Basic/Business/Enterprise. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://linear.app/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://linear.app/pricing",
      "note": "Free plan and paid Basic/Business/Enterprise. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free launcher features for personal/organizational use; AI in paid Pro plans with limited trial. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://www.raycast.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.raycast.com/pricing",
      "note": "Free launcher features for personal/organizational use; AI in paid Pro plans with limited trial. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free forever plan with task allowance; paid upgrades. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://zapier.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://zapier.com/pricing",
      "note": "Free forever plan with task allowance; paid upgrades. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Always-free scheduling plan; paid Standard/Teams/Enterprise. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://calendly.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://calendly.com/pricing",
      "note": "Always-free scheduling plan; paid Standard/Teams/Enterprise. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free plan and paid plans for higher capacity. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://airtable.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://airtable.com/pricing",
      "note": "Free plan and paid plans for higher capacity. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free Hobby plan with limited requests; paid Individual/Teams/Enterprise. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://cursor.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://cursor.com/pricing",
      "note": "Free Hobby plan with limited requests; paid Individual/Teams/Enterprise. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Copilot Free plus paid Pro/Pro+/Max and organization plans. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://github.com/features/copilot/plans"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://github.com/features/copilot/plans",
      "note": "Copilot Free plus paid Pro/Pro+/Max and organization plans. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Free",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Editor free for private/commercial use. Paid extensions/services are separate. Microsoft distribution is built on open source rather than wholly open source. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://code.visualstudio.com/Docs/supporting/faq"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://code.visualstudio.com/Docs/supporting/faq",
      "note": "Editor free for private/commercial use. Paid extensions/services are separate. Microsoft distribution is built on open source rather than wholly open source. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-product"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free core API tools and paid Solo/Team/Enterprise. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://www.postman.com/pricing/"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.postman.com/pricing/",
      "note": "Free core API tools and paid Solo/Team/Enterprise. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free plan with resource limits; paid Pro/Team/Enterprise and usage charges. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://supabase.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://supabase.com/pricing",
      "note": "Free plan with resource limits; paid Pro/Team/Enterprise and usage charges. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free Hobby and paid Pro/Enterprise; usage and eligibility restrictions apply. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://vercel.com/pricing"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://vercel.com/pricing",
      "note": "Free Hobby and paid Pro/Enterprise; usage and eligibility restrictions apply. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Free Starter has replenishing daily Agent credits and monthly cloud credits; paid Core/Pro unlock more. Free published app link expires after 30 days. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://docs.replit.com/billing/plans/starter-plan"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://docs.replit.com/billing/plans/starter-plan",
      "note": "Free Starter has replenishing daily Agent credits and monthly cloud credits; paid Core/Pro unlock more. Free published app link expires after 30 days. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
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
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Not verified; check the current product",
    "freeLimits": "Docker Personal free; Pro/Team/Business paid. Desktop license eligibility restrictions apply. Check current allowances and eligibility on the official page.",
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
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://www.docker.com/pricing/"
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
    "privacyNotes": "Data handling and retention have not been independently verified here. Review the provider’s current privacy documentation before sharing private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.docker.com/pricing/",
      "note": "Docker Personal free; Pro/Team/Business paid. Desktop license eligibility restrictions apply. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
  },
  {
    "slug": "deepseek-guides",
    "name": "DeepSeekDSH",
    "initials": "D",
    "websiteDomain": "deepseekdsh.com",
    "description": "Independent setup, troubleshooting and workflow guides for DeepSeek Harness.",
    "categories": [
      "development",
      "ai"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "Web",
    "registration": "Check the current project",
    "freeLimits": "Check current project information; no allowance or plan guarantee is made here.",
    "bestFor": "Independent setup, troubleshooting and workflow guides for DeepSeek Harness.",
    "limitation": "A community guide, not an official DeepSeek service. Verify version-specific instructions against upstream sources.",
    "features": [
      "Our project",
      "Practical guides"
    ],
    "url": "https://deepseekdsh.com/",
    "sources": [
      {
        "label": "Project website",
        "url": "https://deepseekdsh.com/"
      }
    ],
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "ownedProject": true,
    "privacyNotes": "Review the project and any downstream provider privacy terms before submitting private data."
  },
  {
    "slug": "random-animal-picker",
    "name": "Random Animal Picker",
    "initials": "RAP",
    "websiteDomain": "randomanimalpicker.com",
    "description": "Generate animal prompts and explore animal profiles for creative exercises and prototypes.",
    "categories": [
      "design",
      "other"
    ],
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "Web",
    "registration": "Check the current project",
    "freeLimits": "Animal picker/facts permanently free without account. AI artwork has only a 3-day trial then paid monthly/annual membership. Check current allowances and eligibility on the official page.",
    "bestFor": "Generate animal prompts and explore animal profiles for creative exercises and prototypes.",
    "limitation": "Creative prompts are not an audited random source or a license to reuse animal photography.",
    "features": [
      "Our project",
      "Practical guides"
    ],
    "url": "https://randomanimalpicker.com/",
    "sources": [
      {
        "label": "Project website",
        "url": "https://randomanimalpicker.com/"
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://randomanimalpicker.com/pricing"
      }
    ],
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "ownedProject": true,
    "privacyNotes": "Review the project and any downstream provider privacy terms before submitting private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://randomanimalpicker.com/pricing",
      "note": "Animal picker/facts permanently free without account. AI artwork has only a 3-day trial then paid monthly/annual membership. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
  },
  {
    "slug": "free-ai-voice-generator",
    "name": "Free AI Voice Generator",
    "initials": "FAV",
    "websiteDomain": "freeaivoicegenerator.com",
    "description": "Turn written scripts into voiceovers with available preset text-to-speech voices.",
    "categories": [
      "ai",
      "design"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "Web",
    "registration": "Check the current project",
    "freeLimits": "Check current project information; no allowance or plan guarantee is made here.",
    "bestFor": "Turn written scripts into voiceovers with available preset text-to-speech voices.",
    "limitation": "Preset text-to-speech is the current focus. Memorial voice cloning remains waitlisted; check availability and usage terms.",
    "features": [
      "Our project",
      "Practical guides"
    ],
    "url": "https://freeaivoicegenerator.com/",
    "sources": [
      {
        "label": "Project website",
        "url": "https://freeaivoicegenerator.com/"
      }
    ],
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "ownedProject": true,
    "privacyNotes": "Review the project and any downstream provider privacy terms before submitting private data."
  },
  {
    "slug": "video-script-extractor",
    "name": "Video Script Extractor",
    "initials": "VSE",
    "websiteDomain": "videoscriptextractor.com",
    "description": "Create speech transcripts and subtitle exports for supported video workflows.",
    "categories": [
      "productivity",
      "ai"
    ],
    "pricing": "Freemium",
    "processing": "Not verified",
    "platform": "Web",
    "registration": "Check the current project",
    "freeLimits": "Free daily short-video allowance, paid recurring membership and one-time credit packs. Check current allowances and eligibility on the official page.",
    "bestFor": "Create speech transcripts and subtitle exports for supported video workflows.",
    "limitation": "Speech transcription is not on-screen text OCR. Check supported inputs, access conditions and export availability.",
    "features": [
      "Our project",
      "Practical guides"
    ],
    "url": "https://videoscriptextractor.com/",
    "sources": [
      {
        "label": "Project website",
        "url": "https://videoscriptextractor.com/"
      },
      {
        "label": "Official pricing and plan information",
        "url": "https://videoscriptextractor.com/pricing"
      }
    ],
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "ownedProject": true,
    "privacyNotes": "Review the project and any downstream provider privacy terms before submitting private data.",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://videoscriptextractor.com/pricing",
      "note": "Free daily short-video allowance, paid recurring membership and one-time credit packs. Check current allowances and eligibility on the official page.",
      "freeAccess": "free-plan"
    }
  },
  {
    "slug": "askpdf-directory",
    "name": "AskPDF",
    "initials": "A",
    "websiteDomain": "askpdf.top",
    "description": "Compare PDF tools by task and practical constraints before visiting their providers.",
    "categories": [
      "productivity"
    ],
    "pricing": "Not verified",
    "processing": "Not verified",
    "platform": "Web",
    "registration": "Check the current project",
    "freeLimits": "Check current project information; no allowance or plan guarantee is made here.",
    "bestFor": "Compare PDF tools by task and practical constraints before visiting their providers.",
    "limitation": "AskPDF is a directory. It does not process uploaded PDF files; provider terms and handling differ.",
    "features": [
      "Our project",
      "Practical guides"
    ],
    "url": "https://askpdf.top/",
    "sources": [
      {
        "label": "Project website",
        "url": "https://askpdf.top/"
      }
    ],
    "reviewedOn": "2026-10-09",
    "evidenceStatus": "reviewed",
    "ownedProject": true,
    "privacyNotes": "Review the project and any downstream provider privacy terms before submitting private data."
  },
  {
    "slug": "jasper",
    "name": "Jasper",
    "initials": "J",
    "websiteDomain": "jasper.ai",
    "description": "Create and organize marketing content with AI, brand context and team workflows.",
    "categories": [
      "ai"
    ],
    "pricing": "Paid",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.jasper.ai/pricing",
      "note": "Paid subscriptions; a limited trial is offered, not an ongoing free plan.",
      "freeAccess": "trial-only"
    },
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Check current account and trial requirements",
    "freeLimits": "Paid subscriptions; a limited trial is offered, not an ongoing free plan.",
    "bestFor": "Create and organize marketing content with AI, brand context and team workflows.",
    "limitation": "Check plan-specific seats, features and trial renewal terms. Generated marketing claims need human review.",
    "features": [
      "Marketing content",
      "Brand voice",
      "AI workflows"
    ],
    "url": "https://www.jasper.ai/",
    "sources": [
      {
        "label": "Official pricing and plan information",
        "url": "https://www.jasper.ai/pricing"
      }
    ],
    "reviewedOn": "2026-10-10",
    "evidenceStatus": "reviewed",
    "privacyNotes": "Data handling has not been independently verified. Review provider terms before connecting accounts or sharing private work."
  },
  {
    "slug": "motion",
    "name": "Motion",
    "initials": "M",
    "websiteDomain": "usemotion.com",
    "description": "Plan tasks and projects around an AI-assisted calendar and changing priorities.",
    "categories": [
      "productivity"
    ],
    "pricing": "Paid",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.usemotion.com/pricing",
      "note": "Paid subscription plans with a trial; no ongoing free core-product plan is listed.",
      "freeAccess": "trial-only"
    },
    "processing": "Not verified",
    "platform": "See official source",
    "registration": "Check current account and trial requirements",
    "freeLimits": "Paid subscription plans with a trial; no ongoing free core-product plan is listed.",
    "bestFor": "Plan tasks and projects around an AI-assisted calendar and changing priorities.",
    "limitation": "Review supported calendars, plan limits and trial renewal conditions before connecting your work accounts.",
    "features": [
      "Task planning",
      "Calendar scheduling",
      "Project workflows"
    ],
    "url": "https://www.usemotion.com/",
    "sources": [
      {
        "label": "Official pricing and plan information",
        "url": "https://www.usemotion.com/pricing"
      }
    ],
    "reviewedOn": "2026-10-10",
    "evidenceStatus": "reviewed",
    "privacyNotes": "Data handling has not been independently verified. Review provider terms before connecting accounts or sharing private work."
  },
  {
    "slug": "tower",
    "name": "Tower",
    "initials": "T",
    "websiteDomain": "git-tower.com",
    "description": "Manage Git repositories, branches and code changes through a desktop Git client.",
    "categories": [
      "development"
    ],
    "pricing": "Paid",
    "pricingEvidence": {
      "checkedOn": "2026-10-10",
      "url": "https://www.git-tower.com/pricing",
      "note": "Paid subscriptions after a limited trial. Eligible students, educators and nonprofits may apply for free licenses.",
      "freeAccess": "trial-only"
    },
    "processing": "Not verified",
    "platform": "macOS and Windows",
    "registration": "Check current account and trial requirements",
    "freeLimits": "Paid subscriptions after a limited trial. Eligible students, educators and nonprofits may apply for free licenses.",
    "bestFor": "Manage Git repositories, branches and code changes through a desktop Git client.",
    "limitation": "A paid desktop Git client, not a repository hosting service. Special eligibility licenses do not make the standard plan free.",
    "features": [
      "Git client",
      "Branch management",
      "Desktop workflow"
    ],
    "url": "https://www.git-tower.com/",
    "sources": [
      {
        "label": "Official pricing and plan information",
        "url": "https://www.git-tower.com/pricing"
      }
    ],
    "reviewedOn": "2026-10-10",
    "evidenceStatus": "reviewed",
    "privacyNotes": "Data handling has not been independently verified. Review provider terms before connecting accounts or sharing private work."
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
  const price = paramValue(params, "price").toLowerCase();
  const processing = paramValue(params, "processing");
  const sort = paramValue(params, "sort");
  const result = tools.filter((tool) => (!category || tool.categories.includes(category)) && (!price || (price === "free" ? ["Free", "Open source"].includes(tool.pricing) : tool.pricing.toLowerCase() === price)) && (!processing || tool.processing === processing) && (!query || [tool.name, tool.description, tool.bestFor, tool.platform, ...tool.features, ...(tool.searchKeywords || [])].join(" ").toLowerCase().includes(query)));
  return result.sort(sort === "name" ? (a, b) => a.name.localeCompare(b.name) : (a, b) => Number(!!b.featured) - Number(!!a.featured));
}
