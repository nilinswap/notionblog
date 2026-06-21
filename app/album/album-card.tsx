"use client";

import { useState } from "react";
import Image from "next/image";

interface AlbumCardProps {
  title: string;
  imageUrl: string;
  story: string;
}

export default function AlbumCard({ title, imageUrl, story }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Image
        src={imageUrl}
        alt={title}
        width={400}
        height={600}
        className="transition-transform duration-500 ease-out object-contain w-full"
        style={{
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          height: "auto",
        }}
      />

      {/* Story Overlay - Only on Hover */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 pt-12 flex flex-col justify-end transition-all duration-300 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(8px)",
          pointerEvents: isHovered ? "auto" : "none",
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%)",
        }}
      >
        <div style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
          <h3 className="text-white text-base font-semibold mb-1">{title}</h3>
          <p className="text-gray-100 text-xs leading-relaxed line-clamp-3">
            {story}
          </p>
        </div>
      </div>
    </div>
  );
}
