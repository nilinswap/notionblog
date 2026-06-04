'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AlbumCardProps {
  title: string;
  imageUrl: string;
  story: string;
}

export default function AlbumCard({ title, imageUrl, story }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Image
        src={imageUrl}
        alt={title}
        width={400}
        height={600}
        className="transition-opacity duration-300 object-contain w-full"
        style={{
          opacity: isHovered ? 0.3 : 1,
          height: 'auto',
        }}
      />

      {/* Story Overlay - Only on Hover */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 p-4 flex flex-col justify-between transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">{title}</h3>
          <p className="text-gray-100 text-sm leading-relaxed line-clamp-[10]">
            {story}
          </p>
        </div>
      </div>
    </div>
  );
}
