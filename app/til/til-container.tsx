"use client";

import React, { useState, useMemo } from "react";
import BlogContainer from "@/app/blog/blog-container";
import Link from "next/link";

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

export default function TILContainer({ initialEntries }: TILContainerProps) {
  // Default values based on the current local date (2026-07-03)
  const [activeMode, setActiveMode] = useState<"year" | "month" | "day">("year");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("July");
  const [selectedDay, setSelectedDay] = useState<string>("3");

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

  // Get all unique days for the selected year and month
  const allDays = useMemo(() => {
    const days = new Set(
      initialEntries
        .filter((e) => e.year === selectedYear && e.month === selectedMonth)
        .map((e) => e.day)
    );
    days.add("3"); // Ensure current day is available

    return Array.from(days).sort((a, b) => {
      return parseInt(a, 10) - parseInt(b, 10);
    });
  }, [initialEntries, selectedYear, selectedMonth]);

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

        {/* Date Toggles / Modifiers */}
        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 space-y-4">
          {/* Year Modifier (always visible) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Year</span>
            <div className="flex flex-wrap gap-2">
              {allYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                    selectedYear === year
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Month Modifier (visible in month & day modes) */}
          {(activeMode === "month" || activeMode === "day") && (
            <div className="space-y-2 pt-2 border-t border-slate-200/50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Month</span>
              <div className="flex flex-wrap gap-2">
                {allMonths.map((month) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                      selectedMonth === month
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day Modifier (visible only in day mode) */}
          {activeMode === "day" && (
            <div className="space-y-2 pt-2 border-t border-slate-200/50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Day</span>
              <div className="flex flex-wrap gap-2">
                {allDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      selectedDay === day
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
          <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-5 hover:bg-slate-50/50 transition duration-200"
              >
                <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-orange-400 mt-2 shadow-sm shadow-orange-300" />
                <div className="flex-grow">
                  <p className="text-slate-700 leading-relaxed text-[17px]">
                    {entry.text}
                    <span className="inline-block text-slate-400 text-sm font-normal ml-2 select-none">
                      — {entry.day} {entry.month} {entry.year}
                    </span>
                  </p>
                </div>
              </div>
            ))}
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
