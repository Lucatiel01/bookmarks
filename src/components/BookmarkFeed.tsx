"use client";

import { useState, useMemo } from "react";
import { BookmarkCard } from "./BookmarkCard";
import { SearchBar } from "./SearchBar";
import type { BookmarkWithTags } from "@/actions/bookmarks";

export function BookmarkFeed({
  bookmarks,
  onTagClick,
}: {
  bookmarks: BookmarkWithTags[];
  onTagClick: (tag: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery) return bookmarks;
    const q = searchQuery.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        b.tags.some((t) => t.name.toLowerCase().includes(q))
    );
  }, [bookmarks, searchQuery]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-8 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <svg className="h-12 w-12 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">No bookmarks yet</h3>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">Save your first link to get started.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onTagClick={onTagClick}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
