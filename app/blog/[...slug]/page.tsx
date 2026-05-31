import Link from "next/link";
import BlogContainer from "../blog-container";
import { NotionBlockList } from "@/lib/notion-renderer";
import { getBlogPostBySlug, getBlogPageProps } from "@/lib/notion-api";

export const dynamic = "force-dynamic";

export default async function BlogPostPage(props: unknown) {
  const params = (props as { params?: { slug?: string | string[] } }).params;
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

  const pageProps = await getBlogPageProps(post.id);
  const date = pageProps.date ? new Date(pageProps.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;

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
            <Link href="/blog" className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200">
              Back to blog
            </Link>
          </div>
          {pageProps.excerpt ? <p className="text-slate-600">{pageProps.excerpt}</p> : null}
        </div>

        <NotionBlockList blocks={pageProps.blocks} />
      </div>
    </BlogContainer>
  );
}
