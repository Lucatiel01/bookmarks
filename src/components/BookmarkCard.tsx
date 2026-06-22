"use client";

import { useState } from "react";
import { toggleArchive, deleteBookmark } from "@/actions/bookmarks";
import type { BookmarkWithTags } from "@/actions/bookmarks";

export function BookmarkCard({
  bookmark,
  onTagClick,
  searchQuery,
}: {
  bookmark: BookmarkWithTags;
  onTagClick: (tag: string) => void;
  searchQuery: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleToggleArchive = async () => {
    setArchiving(true);
    await toggleArchive(bookmark.id);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteBookmark(bookmark.id);
  };

  function highlightText(text: string | null) {
    if (!text || !searchQuery) return text;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-indigo-200/60 dark:bg-indigo-500/30 rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:shadow-lg hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-zinc-900/50 ${deleting || archiving ? "opacity-50" : ""}`}
    >
      {/* Preview image */}
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {!imgError && bookmark.image ? (
            <>
              {!imgLoaded && (
                <div className="h-full w-full animate-pulse bg-zinc-200 dark:bg-zinc-700" />
              )}
              <img
                src={bookmark.image}
                alt=""
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.02] ${imgLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"}`}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg className="h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          )}
        </div>
      </a>

      <div className="p-4">
        {/* Domain + favicon */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {bookmark.favicon && (
            <img src={bookmark.favicon} alt="" className="h-4 w-4 rounded" />
          )}
          <span className="truncate">{new URL(bookmark.url).hostname}</span>
          {bookmark.readingTime && (
            <span className="ml-auto whitespace-nowrap">{bookmark.readingTime} min read</span>
          )}
        </div>

        {/* Title */}
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
          <h3 className="mt-2 line-clamp-2 font-semibold text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
            {highlightText(bookmark.title)}
          </h3>
        </a>

        {/* Description */}
        {bookmark.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {highlightText(bookmark.description)}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bookmark.tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagClick(tag.name)}
                className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button
            onClick={handleToggleArchive}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            {bookmark.archived ? "Unarchive" : "Archive"}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open
          </a>
        </div>
      </div>
    </article>
  );
}
