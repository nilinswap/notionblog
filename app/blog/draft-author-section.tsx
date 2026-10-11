"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogPostSummary } from "@/lib/notion-api";

interface DraftAuthorSectionProps {
  drafts: BlogPostSummary[];
}

export default function DraftAuthorSection({ drafts }: DraftAuthorSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!drafts || drafts.length === 0) return null;

  const handleCopy = async (post: BlogPostSummary) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/blog/${post.slug}?token=${post.previewToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <section className="mb-10 rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-900">
              Unpublished Drafts ({drafts.length})
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            These articles are private and hidden from public visitors. Share them using their unique private link.
          </p>
        </div>
        <span className="self-start sm:self-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
          Author View
        </span>
      </div>

      <div className="grid gap-4">
        {drafts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-white p-5 shadow-xs transition hover:border-amber-400"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-amber-800">
                  {post.status || "Draft"}
                </span>
                <span className="text-xs text-slate-400">
                  {post.date || "No date set"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 truncate">
                {post.title}
              </h3>
              {post.excerpt ? (
                <p className="text-sm text-slate-600 line-clamp-1">
                  {post.excerpt}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(post)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all shadow-xs ${
                  copiedId === post.id
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                }`}
              >
                {copiedId === post.id ? (
                  <>
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-3.818a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364l1.757 1.757" />
                    </svg>
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <Link
                href={`/blog/${post.slug}?token=${post.previewToken}`}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs"
              >
                <span>View</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
