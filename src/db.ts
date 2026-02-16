import Dexie, { type EntityTable } from 'dexie';

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

const db = new Dexie('QuickNoteDB') as Dexie & {
  notes: EntityTable<Note, 'id'>;
  folders: EntityTable<Folder, 'id'>;
};

db.version(1).stores({
  notes: 'id, folderId, isPinned, createdAt, updatedAt, *tags',
  folders: 'id, name',
});

export { db };
