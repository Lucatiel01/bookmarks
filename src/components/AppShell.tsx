"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { BookmarkFeed } from "./BookmarkFeed";
import { AddLinkModal } from "./AddLinkModal";
import type { BookmarkWithTags } from "@/actions/bookmarks";

export function AppShell({
  bookmarks,
  tags,
}: {
  bookmarks: BookmarkWithTags[];
  tags: { id: number; name: string }[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? bookmarks.filter((b) => b.tags.some((t) => t.name === activeTag))
    : bookmarks;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 -translate-x-full transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : ""
        }`}
      >
        <Sidebar
          tags={tags}
          activeTag={activeTag}
          onTagClick={(tag) => { setActiveTag(tag); setSidebarOpen(false); }}
          onAddClick={() => { setModalOpen(true); setSidebarOpen(false); }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <BookmarkFeed
        bookmarks={filtered}
        onTagClick={(tag) => setActiveTag((prev) => (prev === tag ? null : tag))}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <AddLinkModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
