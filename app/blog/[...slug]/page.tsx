import Link from "next/link";
import { Metadata } from "next";
import BlogContainer from "../blog-container";
import { NotionBlockList } from "@/lib/notion-renderer";
import { getBlogPostBySlug, getBlogPageProps, getChildBlogPosts } from "@/lib/notion-api";
import DraftPreviewBanner from "../draft-preview-banner";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug?: string | string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function extractToken(searchParams: { [key: string]: string | string[] | undefined }): string | null {
  const rawToken =
    searchParams.token ||
    searchParams.preview ||
    searchParams.key ||
    searchParams.secret ||
    searchParams.draft;

  if (typeof rawToken === "string") return rawToken;
  if (Array.isArray(rawToken) && rawToken.length > 0) return rawToken[0];
  return null;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = Array.isArray(params?.slug) ? params.slug.join("/") : params?.slug || "";
  const token = extractToken(searchParams);
  const post = await getBlogPostBySlug(slug, token);

  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  const pageProps = await getBlogPageProps(post.id);

  return {
    title: pageProps.isDraft ? `[Draft] ${pageProps.title}` : pageProps.title,
    description: pageProps.excerpt || undefined,
    robots: pageProps.isDraft ? { index: false, follow: false } : undefined,
  };
}

export default async function BlogPostPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = Array.isArray(params?.slug) ? params.slug.join("/") : params?.slug || "";
  const previewToken = extractToken(searchParams);

  const post = await getBlogPostBySlug(slug, previewToken);

  if (!post) {
    return (
      <BlogContainer>
        <div className="space-y-6 text-center py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Post Not Found</h1>
          <p className="text-slate-600 max-w-md mx-auto">
            We could not find an active blog post matching <span className="font-semibold text-slate-800">{slug}</span>.
            If this article is a private draft, please ensure you are visiting via the unique private share link.
          </p>
          <Link
            href="/blog"
            className="inline-flex rounded-full bg-orange-500 px-6 py-3 text-white font-medium hover:bg-orange-600 transition shadow-sm hover:shadow"
          >
            Back to blog listing
          </Link>
        </div>
      </BlogContainer>
    );
  }

  const [pageProps, children] = await Promise.all([
    getBlogPageProps(post.id),
    getChildBlogPosts(post.id, previewToken),
  ]);
  const date = pageProps.date ? new Date(pageProps.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
  const parentSlug = pageProps.slug.includes("/") ? pageProps.slug.split("/").slice(0, -1).join("/") : null;

  return (
    <BlogContainer>
      <div className="space-y-8">
        {pageProps.isDraft ? (
          <DraftPreviewBanner
            slug={pageProps.slug}
            previewToken={pageProps.previewToken}
            status={pageProps.status}
          />
        ) : null}

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                  {pageProps.isDraft ? "Draft Preview" : "Blog post"}
                </p>
                {pageProps.isDraft ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                    Unpublished
                  </span>
                ) : null}
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mt-1">{pageProps.title}</h1>
              {date ? (
                <p className="mt-2 text-sm text-slate-500">
                  {pageProps.isDraft ? "Drafted " : "Published "}
                  {date}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {parentSlug ? (
                <Link href={`/blog/${parentSlug}`} className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 transition">
                  Up one level
                </Link>
              ) : null}
              <Link href="/blog" className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 transition">
                All posts
              </Link>
            </div>
          </div>
          {pageProps.excerpt ? <p className="text-slate-600 italic border-l-2 border-orange-300 pl-4 py-1">{pageProps.excerpt}</p> : null}
        </div>

        <NotionBlockList blocks={pageProps.blocks} />

        {children.length > 0 ? (
          <section className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-900">In this section</h2>
            <ul className="mt-4 space-y-3">
              {children.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/blog/${child.slug}`}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-orange-300 hover:bg-white"
                  >
                    <span className="text-lg font-semibold text-slate-900 group-hover:text-orange-600">
                      {child.title}
                    </span>
                    {child.excerpt ? (
                      <span className="mt-1 text-sm text-slate-600">{child.excerpt}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </BlogContainer>
  );
}

