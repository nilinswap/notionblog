import Link from "next/link";
import BlogContainer from "../blog-container";
import { NotionBlockList } from "@/lib/notion-renderer";
import { getBlogPostBySlug, getBlogPageProps, getChildBlogPosts } from "@/lib/notion-api";

export const dynamic = "force-dynamic";

export default async function BlogPostPage(props: unknown) {
  const params = await (props as { params: Promise<{ slug?: string | string[] }> }).params;
  const slug = Array.isArray(params?.slug) ? params.slug.join("/") : params?.slug || "";
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return (
      <BlogContainer>
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Post Not Found</h1>
          <p className="text-slate-600">
            We could not find a blog post matching <span className="font-semibold">{slug}</span>.
          </p>
          <Link href="/blog" className="inline-flex rounded-full bg-orange-500 px-5 py-3 text-white hover:bg-orange-600">
            Back to blog listing
          </Link>
        </div>
      </BlogContainer>
    );
  }

  const [pageProps, children] = await Promise.all([
    getBlogPageProps(post.id),
    getChildBlogPosts(post.id),
  ]);
  const date = pageProps.date ? new Date(pageProps.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
  const parentSlug = pageProps.slug.includes("/") ? pageProps.slug.split("/").slice(0, -1).join("/") : null;

  return (
    <BlogContainer>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-orange-500">Blog post</p>
              <h1 className="text-4xl font-bold text-slate-900">{pageProps.title}</h1>
              {date ? <p className="mt-2 text-sm text-slate-500">Published {date}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {parentSlug ? (
                <Link href={`/blog/${parentSlug}`} className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200">
                  Up one level
                </Link>
              ) : null}
              <Link href="/blog" className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200">
                All posts
              </Link>
            </div>
          </div>
          {pageProps.excerpt ? <p className="text-slate-600">{pageProps.excerpt}</p> : null}
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
