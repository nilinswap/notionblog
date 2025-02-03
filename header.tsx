import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <div className="w-full bg-gray-50 py-4 px-2 sm:px-6 lg:px-8">
      <div className="relative mx-auto rounded-2xl p-[2px] sm:p-[3px] bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
        <div className="bg-white rounded-xl p-4">
          <nav className="flex justify-between items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-orange-500 transition-colors"
            >
              nilinswap
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
              >
                about
              </Link>
              <Link
                href="/now"
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
              >
                now
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-orange-500 transition-colors font-medium"
              >
                blog
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;
