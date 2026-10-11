interface DraftPreviewBannerProps {
  status?: string | null;
  slug?: string;
  previewToken?: string;
}

export default function DraftPreviewBanner({ status }: DraftPreviewBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 shadow-xs">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl" />

      <div className="flex flex-col gap-2">
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
          This article is <strong className="font-semibold text-slate-900">not publicly listed</strong> on the blog. You are viewing a private preview.
        </p>
      </div>
    </div>
  );
}
