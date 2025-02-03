import React from "react";
import Link from "next/link";
import Image from "next/image";

const BlogHomepage = () => {
  // Sample recent blog posts data - replace with your actual data
  const recentPosts = [
    {
      title: "Nature is Dissipative",
      excerpt:
        "Waste may mean different to different people. To vegans, rearing animals for food is a waste (of life); to non-vegans, life living as a vegan itself is a waste...",
      date: "February 3, 2025",
      slug: "nature-is-dissipative",
      imageUrl: "/goghcafe.jpeg",
    },
    // Add more posts as needed
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-2 sm:px-6 lg:px-8">
      {/* Introduction Section */}
      <div className="relative mt-4 max-w-3xl mx-auto rounded-2xl p-[2px] bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
        <div className="bg-white rounded-xl p-4 sm:p-12">
          <div className="flex flex-col items-center text-center mb-8">
            <Image
              src="/me.jpeg"
              alt="Blog Author"
              width={150}
              height={150}
              className="rounded-full mb-6"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to My Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Here, I write about life, technology, and the beautiful chaos that
              exists in between. Join me as we explore the complexities of our
              world through thoughtful analysis and personal stories.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="relative mt-12 max-w-3xl mx-auto rounded-2xl p-[2px] bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
        <div className="bg-white rounded-xl p-4 sm:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Recent Posts
          </h2>
          <div className="space-y-8">
            {recentPosts.map((post, index) => (
              <article key={index} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                    <span className="inline-block text-orange-500 font-medium group-hover:text-orange-600 transition-colors">
                      Read more →
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogHomepage;
