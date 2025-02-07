import React from "react";
import Link from "next/link";

const BlogListing = () => {
  // Sample blog posts data - replace with your actual blog post collection
  const blogPosts = [
    {
      title: "Contrarian",
      excerpt:
        "Where does the whole world disagree with me?",
      date: "February 7, 2025",
      slug: "contrarian",
      tags: ["philosophy", "life", "creativity"],
    },
    {
      title: "Nature is Dissipative",
      excerpt:
        "Waste may mean different to different people. To vegans, rearing animals for food is a waste (of life); to non-vegans, life living as a vegan itself is a waste...",
      date: "February 3, 2025",
      slug: "nature-is-dissipative",
      tags: ["philosophy", "life", "creativity"],
    },
    {
      title: "Wait or Leave",
      excerpt:
        "A man is waiting for his friend at a restaurant. He is waiting for 30 minutes and he is considering leaving. He is faced with a question - wait or leave?",
      date: "February 3, 2025",
      slug: "wait-or-leave",
      tags: ["philosophy", "life", "creativity"],
    }
    // Add more blog posts as needed
  ];

  return (
    <div className="w-full bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-3xl mx-auto rounded-2xl p-0.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
        <div className="bg-white rounded-xl p-8 sm:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Blog Posts
          </h1>

          <div className="space-y-12">
            {blogPosts.map((post, index) => (
              <article
                key={index}
                className="group border-b border-gray-200 pb-12 last:border-b-0"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <div className="flex gap-2">
                        {post.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>

                    <span className="inline-block text-orange-500 font-medium group-hover:text-orange-600 transition-colors">
                      Read more →
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {blogPosts.length === 0 && (
            <p className="text-center text-gray-500 italic">
              No blog posts available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogListing;
