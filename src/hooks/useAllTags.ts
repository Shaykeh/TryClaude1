import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useAllTags(): string[] {
  const tags = useLiveQuery(async () => {
    const notes = await db.notes.toArray();
    const tagSet = new Set<string>();
    for (const note of notes) {
      for (const tag of note.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  });
  return tags ?? [];
}
