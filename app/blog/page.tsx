import Link from "next/link";
import BlogContainer from "./blog-container";
import { queryBlogPosts, queryDraftBlogPosts } from "@/lib/notion-api";
import DraftAuthorSection from "./draft-author-section";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogListing(props: PageProps) {
  const searchParams = props?.searchParams ? await props.searchParams : {};
  const posts = await queryBlogPosts();
  const isConfigured = Boolean(process.env.NOTION_BLOG_DATASOURCE_ID);

  const rawSecret = searchParams?.secret || searchParams?.preview || searchParams?.token;
  const secret = typeof rawSecret === "string" ? rawSecret : Array.isArray(rawSecret) ? rawSecret[0] : null;
  const masterSecret = process.env.DRAFT_SECRET || process.env.BLOG_PREVIEW_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  const showAuthorDrafts = Boolean(
    (masterSecret && secret === masterSecret) ||
    (isDev && (searchParams?.drafts === "true" || searchParams?.preview === "true"))
  );

  const draftPosts = showAuthorDrafts ? await queryDraftBlogPosts() : [];

  return (
    <BlogContainer>
      <div className="space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">
            Top-level posts from your Notion database. Sub-items use hierarchical URLs
            (title plus last 4 characters of the page id), like Notion page links.
          </p>
          {isDev ? (
            <p className="text-xs text-slate-400">
              {showAuthorDrafts ? (
                <Link href="/blog" className="text-amber-600 underline hover:text-amber-700">
                  Hide author draft view
                </Link>
              ) : (
                <Link href="/blog?drafts=true" className="underline hover:text-orange-500">
                  Author view: preview unpublished drafts
                </Link>
              )}
            </p>
          ) : null}
        </div>

        {draftPosts.length > 0 ? (
          <DraftAuthorSection drafts={draftPosts} />
        ) : null}

        {!isConfigured ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 text-orange-900">
            <p className="font-semibold">
              No Notion blog database configured yet.
            </p>
            <p className="mt-2 text-sm text-orange-800">
              Add <code>NOTION_BLOG_DATASOURCE_ID</code> to your <code>.env</code>{" "}
              and expose the correct Notion data source ID for your blog posts.
            </p>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No blog posts found in your Notion database.
          </p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-orange-300"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
                      <span>{post.date || "Unpublished"}</span>
                      <div className="flex flex-wrap gap-2">
                        {post.tags?.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="rounded-full bg-orange-100 px-3 py-1 text-orange-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 group-hover:text-orange-500 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="text-slate-600">{post.excerpt}</p>
                    ) : null}
                    <span className="inline-block text-orange-600 font-semibold">
                      Read article →
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </BlogContainer>
  );
}

