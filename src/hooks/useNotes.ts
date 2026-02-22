import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, type Note } from '../db';

export type SortOrder = 'updatedAt' | 'createdAt' | 'alpha';

export function useNotes(
  folderId: string | null,
  tagFilter: string | null,
  searchQuery: string,
  sortOrder: SortOrder,
  showArchived: boolean = false,
) {
  const notes = useLiveQuery(async () => {
    let collection = db.notes.toCollection();
    let results = await collection.toArray();

    // Filter by archived status
    results = results.filter((n) => (n.isArchived ?? false) === showArchived);

    if (folderId) {
      results = results.filter((n) => n.folderId === folderId);
    }

    if (tagFilter) {
      results = results.filter((n) => n.tags.includes(tagFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    results.sort((a, b) => {
      // Pinned notes always first
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

      switch (sortOrder) {
        case 'alpha':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return results;
  }, [folderId, tagFilter, searchQuery, sortOrder, showArchived]);

  return notes ?? [];
}

export async function createNote(folderId: string | null): Promise<string> {
  const now = new Date().toISOString();
  const id = uuidv4();
  await db.notes.add({
    id,
    title: '',
    content: '',
    folderId,
    tags: [],
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateNote(id: string, changes: Partial<Note>) {
  await db.notes.update(id, {
    ...changes,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteNote(id: string) {
  await db.notes.delete(id);
}

export async function togglePin(id: string, currentPinned: boolean) {
  await db.notes.update(id, {
    isPinned: !currentPinned,
    updatedAt: new Date().toISOString(),
  });
}

export async function archiveNote(id: string) {
  await db.notes.update(id, {
    isArchived: true,
    isPinned: false,
    updatedAt: new Date().toISOString(),
  });
}

export async function unarchiveNote(id: string) {
  await db.notes.update(id, {
    isArchived: false,
    updatedAt: new Date().toISOString(),
  });
}
