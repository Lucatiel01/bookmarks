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
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? bookmarks.filter((b) => b.tags.some((t) => t.name === activeTag))
    : bookmarks;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        tags={tags}
        activeTag={activeTag}
        onTagClick={setActiveTag}
        onAddClick={() => setModalOpen(true)}
      />
      <BookmarkFeed bookmarks={filtered} onTagClick={(tag) => setActiveTag((prev) => (prev === tag ? null : tag))} />
      <AddLinkModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
