import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <div className="w-full bg-gray-50 py-4 px-2 sm:px-6 lg:px-8">
      <div className="relative mx-auto rounded-2xl p-[2px] sm:p-[3px] bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
        <div className="bg-white rounded-xl p-4">
          <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold text-gray-900 hover:text-orange-500 transition-colors"
            >
              nilinswap
            </Link>

            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-4 gap-y-2 sm:gap-6 text-sm sm:text-base">
              <Link
                href="https://one.nilinswap.com"
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
              >
                ReadLog
              </Link>
              <Link
                href="/album"
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
              >
                Album
              </Link>
              <Link
                href="/blog/now"
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
              >
                Now
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
              >
                Blogs
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;
