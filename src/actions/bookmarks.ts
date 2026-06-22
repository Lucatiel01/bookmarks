"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, desc } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks, tags, bookmarkTags } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { scrapeOg } from "@/lib/og-scraper";
import { estimateReadingTime } from "@/lib/reading-time";

export async function addBookmark(url: string, tagNames?: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const og = await scrapeOg(url);

  const inserted = await db
    .insert(bookmarks)
    .values({
      userId: user.id,
      url,
      title: og.title,
      description: og.description,
      image: og.image,
      favicon: og.favicon,
      readingTime: estimateReadingTime(`${og.title ?? ""} ${og.description ?? ""}`),
    })
    .returning({ id: bookmarks.id });

  const bookmarkId = inserted[0]?.id;
  if (!bookmarkId) throw new Error("Failed to create bookmark");

  if (tagNames && tagNames.length > 0) {
    for (const name of tagNames) {
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) continue;
      const existing = await db.select().from(tags).where(eq(tags.name, trimmed));
      let tag = existing[0];
      if (!tag) {
        const insertedTag = await db.insert(tags).values({ name: trimmed }).returning({ id: tags.id, name: tags.name });
        tag = insertedTag[0];
      }
      await db.insert(bookmarkTags).values({ bookmarkId, tagId: tag.id });
    }
  }

  revalidatePath("/");
  return { id: bookmarkId };
}

export async function toggleArchive(bookmarkId: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const rows = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, user.id)));

  const bookmark = rows[0];
  if (!bookmark) throw new Error("Not found");

  await db
    .update(bookmarks)
    .set({ archived: !bookmark.archived })
    .where(eq(bookmarks.id, bookmarkId));

  revalidatePath("/");
  revalidatePath("/archive");
}

export async function deleteBookmark(bookmarkId: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await db
    .delete(bookmarkTags)
    .where(eq(bookmarkTags.bookmarkId, bookmarkId));

  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, user.id)));

  revalidatePath("/");
  revalidatePath("/archive");
}

export async function updateTags(bookmarkId: number, tagNames: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await db.delete(bookmarkTags).where(eq(bookmarkTags.bookmarkId, bookmarkId));

  for (const name of tagNames) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) continue;
    const existing = await db.select().from(tags).where(eq(tags.name, trimmed));
    let tag = existing[0];
    if (!tag) {
      const insertedTag = await db.insert(tags).values({ name: trimmed }).returning({ id: tags.id, name: tags.name });
      tag = insertedTag[0];
    }
    await db.insert(bookmarkTags).values({ bookmarkId, tagId: tag.id });
  }

  revalidatePath("/");
  revalidatePath("/archive");
}

export interface BookmarkWithTags {
  id: number;
  userId: number;
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  readingTime: number | null;
  archived: boolean;
  createdAt: Date;
  tags: { id: number; name: string }[];
}

export async function getBookmarks(archived: boolean = false): Promise<BookmarkWithTags[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.archived, archived)))
    .orderBy(desc(bookmarks.createdAt));

  const bookmarkIds = rows.map((b) => b.id);
  let tagMap = new Map<number, { id: number; name: string }[]>();

  if (bookmarkIds.length > 0) {
    const btRows = await db
      .select({
        bookmarkId: bookmarkTags.bookmarkId,
        tagId: bookmarkTags.tagId,
        tagName: tags.name,
      })
      .from(bookmarkTags)
      .innerJoin(tags, eq(bookmarkTags.tagId, tags.id))
      .where(inArray(bookmarkTags.bookmarkId, bookmarkIds));

    for (const bt of btRows) {
      const existing = tagMap.get(bt.bookmarkId) ?? [];
      existing.push({ id: bt.tagId, name: bt.tagName });
      tagMap.set(bt.bookmarkId, existing);
    }
  }

  return rows.map((b) => ({
    ...b,
    tags: tagMap.get(b.id) ?? [],
  }));
}

export async function getAllTags() {
  const user = await getCurrentUser();
  if (!user) return [];

  const userBookmarkIds = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(eq(bookmarks.userId, user.id));

  const ids = userBookmarkIds.map((b) => b.id);
  if (ids.length === 0) return [];

  const btRows = await db
    .select()
    .from(bookmarkTags)
    .where(inArray(bookmarkTags.bookmarkId, ids));

  const tagIds = [...new Set(btRows.map((bt) => bt.tagId))];
  if (tagIds.length === 0) return [];

  return db.select().from(tags).where(inArray(tags.id, tagIds));
}
