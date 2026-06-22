import { getBookmarks, getAllTags } from "@/actions/bookmarks";
import { AppShell } from "@/components/AppShell";

export default async function ArchivePage() {
  const [bookmarks, tags] = await Promise.all([getBookmarks(true), getAllTags()]);
  return <AppShell bookmarks={bookmarks} tags={tags} />;
}
