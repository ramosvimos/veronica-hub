"use client";

import { useState } from "react";
import type { PdfTool } from "@/data/pdf-catalog";

export function getToolDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

interface PdfToolIconProps {
  tool: Pick<PdfTool, "name" | "initials" | "categories" | "url" | "iconUrl">;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function PdfToolIcon({ tool, size = 40, className = "" }: PdfToolIconProps) {
  const [hasError, setHasError] = useState(false);
  const iconSrc = tool.iconUrl?.startsWith("/tool-icons/") ? tool.iconUrl : "";
  const category = tool.categories?.[0] || "edit-organize";

  if (!iconSrc || hasError) {
    return (
      <span
        className={`pdf-tool-monogram pdf-monogram-${category} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${Math.max(12, Math.round(size * 0.4))}px`,
          lineHeight: 1,
        }}
        aria-hidden="true"
        title={tool.name}
      >
        {tool.initials}
      </span>
    );
  }

  return (
    <span
      className={`pdf-tool-logo-box ${size >= 48 ? "is-lg" : ""} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-label={`${tool.name} logo`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconSrc}
        alt={`${tool.name} icon`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
      />
    </span>
  );
}
