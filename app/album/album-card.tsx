"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export interface SubItem {
  imageUrl: string;
  title: string;
  story: string;
  date?: string;
}

interface AlbumCardProps {
  title: string;
  imageUrl: string;
  images?: string[];
  subitems?: SubItem[];
  story: string;
  date?: string;
}

export default function AlbumCard({ title, imageUrl, subitems = [], story, date }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setIsHovered(false);
    }
  };

  const handleClick = () => {
    if (isTouch) {
      setIsHovered((prev) => !prev);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const slideList = subitems.length > 0
    ? subitems
    : [{ imageUrl, title, story, date }];

  const currentSlide = slideList[activeImgIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    isProgrammaticScroll.current = true;
    setActiveImgIndex((prev) => (prev - 1 + slideList.length) % slideList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    isProgrammaticScroll.current = true;
    setActiveImgIndex((prev) => (prev + 1) % slideList.length);
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      if (clientWidth > 0) {
        const targetScrollLeft = activeImgIndex * clientWidth;
        if (isProgrammaticScroll.current) {
          if (Math.abs(scrollLeft - targetScrollLeft) < 5) {
            isProgrammaticScroll.current = false;
          }
          return;
        }

        const index = Math.round(scrollLeft / clientWidth);
        if (index !== activeImgIndex && index >= 0 && index < slideList.length) {
          setActiveImgIndex(index);
        }
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current && slideList.length > 1) {
      const { clientWidth, scrollLeft } = scrollRef.current;
      const targetScrollLeft = activeImgIndex * clientWidth;
      if (Math.abs(scrollLeft - targetScrollLeft) > 5) {
        scrollRef.current.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [activeImgIndex, slideList.length]);

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Spacer Image to define the dynamic masonry height based on first image */}
      <div className="w-full h-auto select-none pointer-events-none opacity-0">
        <Image
          src={slideList[0].imageUrl}
          alt={slideList[0].title}
          width={400}
          height={600}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Slidable Carousel Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`flex h-full ${
            slideList.length > 1
              ? "overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
              : "overflow-hidden"
          }`}
        >
          {slideList.map((slide, idx) => (
            <div
              key={idx}
              className={`relative h-full w-full flex-shrink-0 transition-transform duration-500 ease-out ${
                slideList.length > 1 ? "snap-start" : ""
              }`}
              style={{
                transform: isHovered ? "scale(1.05)" : "scale(1)",
              }}
            >
              <Image
                src={slide.imageUrl}
                alt={`${slide.title} - image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Indicators (Dots) - Inside Image at the bottom */}
      {slideList.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 pointer-events-none">
          {slideList.map((_, dotIdx) => (
            <div
              key={dotIdx}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-md ${
                dotIdx === activeImgIndex ? "bg-white w-3" : "bg-white/40 w-1.5"
              }`}
            />
          ))}
        </div>
      )}

      {/* Left & Right navigation arrows */}
      {slideList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center shadow-md transition-all duration-300 z-30 focus:outline-none"
            style={{
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? "auto" : "none",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center shadow-md transition-all duration-300 z-30 focus:outline-none"
            style={{
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? "auto" : "none",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      {/* Story Overlay - Only on Hover */}
      <div
        className="absolute bottom-0 left-0 right-0 pl-4 pr-4 pt-12 pb-8 flex flex-col justify-end transition-all duration-300 ease-out z-20"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(8px)",
          pointerEvents: isHovered ? "auto" : "none",
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)",
        }}
      >
        <div style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
          <h3 className="text-white text-base font-semibold mb-0.5">{currentSlide.title}</h3>
          {currentSlide.date && (
            <p className="text-gray-300 text-[10px] font-semibold mb-1 uppercase tracking-wider">
              {formatDate(currentSlide.date)}
            </p>
          )}
          <p
            onClick={(e) => e.stopPropagation()}
            className="text-gray-100 text-xs leading-relaxed max-h-24 overflow-y-auto pr-1"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.2) transparent",
            }}
          >
            {currentSlide.story}
          </p>
        </div>
      </div>
    </div>
  );
}
