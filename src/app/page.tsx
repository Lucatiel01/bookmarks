import { getBookmarks, getAllTags } from "@/actions/bookmarks";
import { AppShell } from "@/components/AppShell";

export default async function HomePage() {
  const [bookmarks, tags] = await Promise.all([getBookmarks(false), getAllTags()]);
  return <AppShell bookmarks={bookmarks} tags={tags} />;
}
