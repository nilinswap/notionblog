"use client";

import { useState, useEffect } from "react";

interface DraftPreviewBannerProps {
  slug: string;
  previewToken: string;
  status?: string | null;
}

export default function DraftPreviewBanner({
  slug,
  previewToken,
  status,
}: DraftPreviewBannerProps) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setFullUrl(`${origin}/blog/${slug}?token=${previewToken}`);
    }
  }, [slug, previewToken]);

  const handleCopy = async () => {
    const urlToCopy = fullUrl || (typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}?token=${previewToken}` : `/blog/${slug}?token=${previewToken}`);
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers or restricted permissions
      const textarea = document.createElement("textarea");
      textarea.value = urlToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 shadow-sm transition-all hover:shadow-md">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 border border-amber-300">
              <svg
                className="h-3.5 w-3.5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              Private Draft Preview
            </span>

            {status ? (
              <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs">
                Status: {status}
              </span>
            ) : null}
          </div>

          <p className="text-sm text-slate-700">
            This article is <strong className="font-semibold text-slate-900">not publicly listed</strong> on the blog. Only people with this private link can view it.
          </p>
        </div>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-sm ${
              copied
                ? "bg-emerald-600 text-white shadow-emerald-200"
                : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow"
            }`}
          >
            {copied ? (
              <>
                <svg
                  className="h-4 w-4 text-emerald-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-3.818a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364l1.757 1.757"
                  />
                </svg>
                <span>Copy Private Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share URL preview snippet */}
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/70 px-3.5 py-2 text-xs text-slate-600 border border-amber-200/70">
        <span className="font-medium text-amber-900 shrink-0">Private Link:</span>
        <code className="truncate font-mono text-slate-800">
          {fullUrl || `/blog/${slug}?token=${previewToken}`}
        </code>
      </div>
    </div>
  );
}
