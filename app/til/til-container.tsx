"use client";

import React, { useState, useMemo, useEffect } from "react";
import BlogContainer from "@/app/blog/blog-container";
import Link from "next/link";
import { lusitana, kalam } from "@/app/ui/fonts";

type TILEntry = {
  id: string;
  text: string;
  day: string;
  month: string;
  year: string;
};

interface TILContainerProps {
  initialEntries: TILEntry[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const monthNameToNum = (name: string): string => {
  const normalized = name.trim().toLowerCase();
  const index = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === normalized || m.toLowerCase().slice(0, 3) === normalized.slice(0, 3)
  );
  if (index === -1) return "07";
  return String(index + 1).padStart(2, "0");
};

const numToMonthName = (numStr: string): string => {
  const num = parseInt(numStr, 10);
  if (num >= 1 && num <= 12) {
    return MONTH_NAMES[num - 1];
  }
  return "July";
};

const getCalendarDays = (yearStr: string, monthStr: string) => {
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthNameToNum(monthStr), 10);

  // Day of the week for the 1st of the month: 0 (Sun) to 6 (Sat)
  const firstDayDate = new Date(year, monthNum - 1, 1);
  const startDayOfWeek = firstDayDate.getDay();

  // Number of days in the month
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  const days: (number | null)[] = [];

  // Add empty padding for days before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add day numbers
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return days;
};

export default function TILContainer({ initialEntries }: TILContainerProps) {
  // Default values based on the current local date (2026-07-05)
  const [activeMode, setActiveMode] = useState<"year" | "month" | "day">("year");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("July");
  const [selectedDay, setSelectedDay] = useState<string>("5");

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [enteringIndex, setEnteringIndex] = useState<number | null>(null);
  const [swipeDir, setSwipeDir] = useState<"exit-right" | "enter-left" | "entering" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [clickedCardId, setClickedCardId] = useState<string | null>(null);

  const entriesCountPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    initialEntries.forEach((entry) => {
      if (entry.year === selectedYear && entry.month === selectedMonth) {
        const d = String(parseInt(entry.day, 10));
        counts[d] = (counts[d] || 0) + 1;
      }
    });
    return counts;
  }, [initialEntries, selectedYear, selectedMonth]);

  const calendarDays = useMemo(() => {
    return getCalendarDays(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Get all unique years in descending order
  const allYears = useMemo(() => {
    const years = new Set(initialEntries.map((e) => e.year));
    // Ensure "2026" is always present as a fallback option even if no entries exist yet
    years.add("2026");
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [initialEntries]);

  // Get all unique months for the selected year in logical/calendar order if possible
  const allMonths = useMemo(() => {
    const months = new Set(
      initialEntries.filter((e) => e.year === selectedYear).map((e) => e.month)
    );
    months.add("July"); // Ensure current month is available

    const monthOrder: Record<string, number> = {
      january: 1, jan: 1,
      february: 2, feb: 2,
      march: 3, mar: 3,
      april: 4, apr: 4,
      may: 5,
      june: 6, jun: 6,
      july: 7, jul: 7,
      august: 8, aug: 8,
      september: 9, sep: 9,
      october: 10, oct: 10,
      november: 11, nov: 11,
      december: 12, dec: 12,
    };

    return Array.from(months).sort((a, b) => {
      const orderA = monthOrder[a.toLowerCase()] || 99;
      const orderB = monthOrder[b.toLowerCase()] || 99;
      return orderA - orderB;
    });
  }, [initialEntries, selectedYear]);

  // Filter entries based on the current selection and mode
  const filteredEntries = useMemo(() => {
    return initialEntries.filter((entry) => {
      if (activeMode === "year") {
        return entry.year === selectedYear;
      } else if (activeMode === "month") {
        return entry.year === selectedYear && entry.month === selectedMonth;
      } else {
        return (
          entry.year === selectedYear &&
          entry.month === selectedMonth &&
          entry.day === selectedDay
        );
      }
    });
  }, [initialEntries, activeMode, selectedYear, selectedMonth, selectedDay]);

  // Stable random rotation angle between -15 and 15 degrees
  const getRotationAngle = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Scale hash to range [-15, 15]
    return (Math.abs(hash) % 31) - 15;
  };

  // Stable random post-it colors (soft pastels)
  const getPostitColorClass = (id: string) => {
    const colors = [
      "bg-[#fffbeb] text-amber-950 border-[#fde68a]/50 shadow-amber-950/5",    // Soft yellow
      "bg-[#fff1f2] text-rose-950 border-[#fecdd3]/50 shadow-rose-950/5",       // Soft rose
      "bg-[#f0f9ff] text-sky-950 border-[#bae6fd]/50 shadow-sky-950/5",         // Soft blue
      "bg-[#f0fdf4] text-emerald-950 border-[#bbf7d0]/50 shadow-emerald-950/5", // Soft green
      "bg-[#faf5ff] text-purple-950 border-[#e9d5ff]/50 shadow-purple-950/5",   // Soft purple
      "bg-[#fff7ed] text-orange-950 border-[#fed7aa]/50 shadow-orange-950/5"    // Soft orange
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Stable translation and rotation styling for grouped/coagulated layout
  const getDistributedStyle = (id: string, index: number, isFocused: boolean) => {
    let hash1 = 0;
    let hash2 = 0;
    let hash3 = 0;
    for (let i = 0; i < id.length; i++) {
      hash1 = id.charCodeAt(i) + ((hash1 << 5) - hash1);
      hash2 = id.charCodeAt(i) * 31 + ((hash2 << 7) - hash2);
      hash3 = id.charCodeAt(i) * 17 + ((hash3 << 3) - hash3);
    }

    // Rotation between -12 and 12 degrees
    const rotation = (Math.abs(hash1) % 25) - 12;
    // Translate X between -15px and 15px
    const translateX = (Math.abs(hash2) % 31) - 15;
    // Translate Y between -15px and 15px
    const translateY = (Math.abs(hash3) % 31) - 15;

    return {
      transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${isFocused ? 1.05 : 1})`,
      zIndex: isFocused ? 50 : 10 + (index % 10),
    };
  };

  // Reset index and card selection on filter change
  useEffect(() => {
    setCurrentIndex(0);
    setEnteringIndex(null);
    setSwipeDir(null);
    setIsTransitioning(false);
    setClickedCardId(null);
  }, [filteredEntries]);

  const handleNext = () => {
    if (isTransitioning || filteredEntries.length <= 1) return;
    setIsTransitioning(true);
    setSwipeDir("exit-right");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredEntries.length);
      setSwipeDir(null);
      setIsTransitioning(false);
    }, 400);
  };

  const handlePrev = () => {
    if (isTransitioning || filteredEntries.length <= 1) return;
    setIsTransitioning(true);
    const prevIndex = (currentIndex - 1 + filteredEntries.length) % filteredEntries.length;
    setEnteringIndex(prevIndex);
    setSwipeDir("enter-left");
    setTimeout(() => {
      setSwipeDir("entering");
    }, 20);
    setTimeout(() => {
      setCurrentIndex(prevIndex);
      setEnteringIndex(null);
      setSwipeDir(null);
      setIsTransitioning(false);
    }, 420);
  };

  const getCardStyle = (index: number) => {
    const N = filteredEntries.length;
    const rotation = getRotationAngle(filteredEntries[index].id);

    // 1. If this card is currently entering from the left (on click Prev)
    if (index === enteringIndex) {
      if (swipeDir === "enter-left") {
        return {
          transform: `translateX(-150%) rotate(${rotation - 25}deg) scale(0.9)`,
          opacity: 0,
          zIndex: 60,
          transition: "none",
        };
      }
      if (swipeDir === "entering") {
        return {
          transform: `translate(0, 0) rotate(${rotation}deg) scale(1)`,
          opacity: 1,
          zIndex: 60,
          transition: "transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 400ms ease-out",
        };
      }
    }

    // 2. If this card is currently the top card and is exiting (on click Next)
    if (index === currentIndex && swipeDir === "exit-right") {
      return {
        transform: `translateX(150%) rotate(${rotation + 25}deg) scale(0.9)`,
        opacity: 0,
        zIndex: 60,
        transition: "transform 400ms ease-in, opacity 400ms ease-in",
      };
    }

    // 3. For all other cards, calculate their stacked position relative to the main card
    const distance = N > 1 ? (index - currentIndex + N) % N : 0;
    const isTop = distance === 0;
    const isSecond = distance === 1;
    const isThird = distance === 2;
    const isFourth = distance === 3;

    if (isTop) {
      return {
        transform: `translate(0, 0) rotate(${rotation}deg) scale(1)`,
        opacity: 1,
        zIndex: 50,
        transition: "transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 400ms ease-out",
      };
    }

    if (isSecond) {
      return {
        transform: `translate(0, 8px) rotate(${rotation}deg) scale(0.96)`,
        opacity: 0.9,
        zIndex: 40,
        transition: "transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 400ms ease-out",
      };
    }

    if (isThird) {
      return {
        transform: `translate(0, 16px) rotate(${rotation}deg) scale(0.92)`,
        opacity: 0.8,
        zIndex: 30,
        transition: "transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 400ms ease-out",
      };
    }

    if (isFourth) {
      return {
        transform: `translate(0, 24px) rotate(${rotation}deg) scale(0.88)`,
        opacity: 0.7,
        zIndex: 20,
        transition: "transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 400ms ease-out",
      };
    }

    return {
      transform: `translate(0, 32px) rotate(${rotation}deg) scale(0.8)`,
      opacity: 0,
      zIndex: 10,
      pointerEvents: "none" as const,
      transition: "transform 400ms ease-out, opacity 400ms ease-out",
    };
  };

  return (
    <BlogContainer>
      <div className="space-y-8 font-sans">
        {/* Header / Intro */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold uppercase tracking-wider">
            ⚡ Micro-journal
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Today I Lived <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">(TIL)</span>
          </h1>
          <p className="text-slate-500 max-w-md mx-auto text-base">
            Reflections, lessons, and thoughts captured day by day from my Notion workspace.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(["year", "month", "day"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  activeMode === mode
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Date Calendar / Dropdown Selectors */}
        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 space-y-4">
          {/* Year Mode Selector */}
          {activeMode === "year" && (
            <div className="space-y-2">
              <label htmlFor="year-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Select Year
              </label>
              <div className="relative inline-block w-full max-w-xs">
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 text-slate-800 bg-white font-semibold px-4 py-3 appearance-none cursor-pointer pr-10"
                >
                  {allYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>
          )}

          {/* Month/Day Mode Selectors (Both show Year & Month dropdowns, day picker is removed) */}
          {(activeMode === "month" || activeMode === "day") && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <label htmlFor="month-year-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Select Year
                </label>
                <div className="relative inline-block w-full">
                  <select
                    id="month-year-select"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setActiveMode("month");
                    }}
                    className="block w-full rounded-xl border border-slate-200 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 text-slate-800 bg-white font-semibold px-4 py-3 appearance-none cursor-pointer pr-10"
                  >
                    {allYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <span className="text-xs">▼</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <label htmlFor="month-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Select Month
                </label>
                <div className="relative inline-block w-full">
                  <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setActiveMode("month");
                    }}
                    className="block w-full rounded-xl border border-slate-200 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 text-slate-800 bg-white font-semibold px-4 py-3 appearance-none cursor-pointer pr-10"
                  >
                    {allMonths.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <span className="text-xs">▼</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unified Flex Layout for Calendar Grid and Card Stack */}
        <div className="flex flex-col gap-8">
          {/* Component A: Calendar Grid (Rendered in month and day modes) */}
          {(activeMode === "month" || activeMode === "day") && (
            <div className="order-2 md:order-1 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm max-w-md w-full mx-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  📅 {selectedMonth} {selectedYear}
                </span>
                {activeMode === "day" && (
                  <button
                    onClick={() => setActiveMode("month")}
                    className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition uppercase"
                  >
                    Show whole month
                  </button>
                )}
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                  <div key={dayName} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none py-1">
                    {dayName}
                  </div>
                ))}
                {calendarDays.map((dayNum, idx) => {
                  if (dayNum === null) {
                    return <div key={`empty-${idx}`} className="aspect-square" />;
                  }

                  const dayStr = String(dayNum);
                  const count = entriesCountPerDay[dayStr] || 0;
                  const isSelected = activeMode === "day" && selectedDay === dayStr;

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => {
                        setSelectedDay(dayStr);
                        setActiveMode("day");
                      }}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all select-none border group ${
                        isSelected
                          ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20 scale-105 z-10 font-bold"
                          : count > 0
                          ? "bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100 hover:border-orange-200"
                          : "bg-slate-50/50 border-transparent text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                      }`}
                    >
                      <span>{dayNum}</span>
                      {count > 0 && (
                        <span
                          className={`absolute bottom-0.5 px-1 min-w-[14px] h-[14px] rounded-full text-[8px] font-extrabold flex items-center justify-center leading-none ${
                            isSelected
                              ? "bg-white text-orange-600 shadow-sm"
                              : "bg-orange-500 text-white shadow-sm"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Component B: Cards Stack and Controls wrapper */}
          <div className="order-1 md:order-2 w-full flex flex-col gap-6">
            {/* Results Count & Section Header */}
            <div className="flex justify-between items-center px-2">
              <h2 className="text-lg font-bold text-slate-800">
                {activeMode === "year" && `Entries in ${selectedYear}`}
                {activeMode === "month" && `Entries in ${selectedMonth} ${selectedYear}`}
                {activeMode === "day" && `Entries for ${selectedDay} ${selectedMonth} ${selectedYear}`}
              </h2>
              <span className="text-xs font-medium text-slate-400">
                {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"} found
              </span>
            </div>

            {/* Entries Listing */}
            {filteredEntries.length > 0 ? (
              <div className="w-full">
                
                {/* 1. PACKED SCATTERED LAYOUT (Desktop View in Year/Month mode - cards coagulated together) */}
                {(activeMode === "year" || activeMode === "month") && (
                  <div className="hidden md:block w-full">
                    <div className="flex flex-wrap gap-x-2 gap-y-6 justify-center items-center p-8 bg-slate-50/20 border border-slate-100 rounded-3xl min-h-[400px] bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] shadow-inner mb-6 max-w-5xl mx-auto overflow-visible">
                      {filteredEntries.map((entry, index) => {
                        const isFocused = clickedCardId === entry.id;
                        const pastelClass = getPostitColorClass(entry.id);

                        return (
                          <div
                            key={entry.id}
                            onClick={() => setClickedCardId(entry.id)}
                            style={getDistributedStyle(entry.id, index, isFocused)}
                            className={`relative w-64 h-64 flex flex-col justify-between p-5 rounded-2xl border select-none transition-all duration-300 cursor-pointer -mx-1.5 -my-1.5 hover:scale-102 hover:shadow-lg ${
                              isFocused 
                                ? `${pastelClass} ring-2 ring-orange-500/20 shadow-xl scale-105` 
                                : `${pastelClass} shadow-md`
                            }`}
                          >
                            {/* Simulated Tape strip */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/35 backdrop-blur-[1px] border border-white/20 shadow-sm rotate-[-1.5deg] z-10" />

                            {/* Card Header */}
                            <div className="flex justify-between items-center text-[9px] font-extrabold tracking-widest uppercase opacity-60">
                              <span>📌 TIL</span>
                              <span>
                                {entry.day} {entry.month} {entry.year}
                              </span>
                            </div>

                            {/* Card Content */}
                            <div className="flex-grow flex items-center justify-center my-2 overflow-hidden">
                              <p
                                className={`${kalam.className} text-base text-slate-800 text-center leading-relaxed font-semibold break-words max-h-[140px] overflow-y-auto w-full px-1`}
                              >
                                {entry.text}
                              </p>
                            </div>

                            {/* Card Footer */}
                            <div className="flex justify-between items-center text-[8px] font-bold tracking-wider uppercase opacity-55">
                              <span>notion log</span>
                              <span>
                                {index + 1} of {filteredEntries.length}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. STACKED LAYOUT (Mobile View in Year/Month mode, or both views in Day mode) */}
                <div className={`flex flex-col items-center gap-8 py-6 ${
                  (activeMode === "year" || activeMode === "month") ? "md:hidden" : ""
                }`}>
                  <div className="relative w-full max-w-[300px] h-[300px] sm:max-w-[340px] sm:h-[340px] flex items-center justify-center">
                    {filteredEntries.map((entry, index) => {
                      const distance = filteredEntries.length > 1 ? (index - currentIndex + filteredEntries.length) % filteredEntries.length : 0;
                      const isVisible = index === enteringIndex || distance < 4;
                      if (!isVisible) return null;

                      const isTop = distance === 0 && index !== enteringIndex;

                      return (
                        <div
                          key={entry.id}
                          onClick={() => isTop && handleNext()}
                          style={getCardStyle(index)}
                          className={`absolute inset-0 flex flex-col justify-between p-6 rounded-2xl border select-none transition-all duration-300 cursor-pointer ${getPostitColorClass(
                            entry.id
                          )}`}
                        >
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/35 backdrop-blur-[1px] border border-white/20 shadow-sm rotate-[-1.5deg] z-10" />

                          <div className="flex justify-between items-center text-[10px] font-extrabold tracking-widest uppercase opacity-60">
                            <span>📌 TIL</span>
                            <span>
                              {entry.day} {entry.month} {entry.year}
                            </span>
                          </div>

                          <div className="flex-grow flex items-center justify-center my-3 overflow-hidden">
                            <p
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className={`${kalam.className} text-[15px] sm:text-[18px] text-slate-800 text-center leading-relaxed font-semibold break-words max-h-[160px] sm:max-h-[190px] overflow-y-auto w-full px-1`}
                            >
                              {entry.text}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-[9px] font-bold tracking-wider uppercase opacity-55">
                            <span>notion log</span>
                            <span>
                              {index + 1} of {filteredEntries.length}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation Controls */}
                  {filteredEntries.length > 1 && (
                    <div className="flex items-center gap-6 mt-4">
                      <button
                        onClick={handlePrev}
                        disabled={isTransitioning}
                        className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-orange-500 hover:border-orange-200 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous Card"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>

                      <div className="text-sm font-bold text-slate-600 min-w-[70px] text-center select-none">
                        {currentIndex + 1} / {filteredEntries.length}
                      </div>

                      <button
                        onClick={handleNext}
                        disabled={isTransitioning}
                        className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-orange-500 hover:border-orange-200 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next Card"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
                <span className="text-4xl">📭</span>
                <h3 className="mt-4 text-lg font-bold text-slate-800">No logs found</h3>
                <p className="mt-2 text-slate-400 text-sm max-w-xs mx-auto">
                  There are no entries logged in Notion for the selected period.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="flex justify-center pt-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-semibold text-orange-500 hover:text-orange-600 group"
          >
            ← Back to all blogs
          </Link>
        </div>
      </div>
    </BlogContainer>
  );
}
