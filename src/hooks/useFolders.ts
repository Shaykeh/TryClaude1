import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';

export function useFolders() {
  const folders = useLiveQuery(() => db.folders.toArray());
  return folders ?? [];
}

export async function createFolder(name: string): Promise<string> {
  const id = uuidv4();
  await db.folders.add({
    id,
    name,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function renameFolder(id: string, name: string) {
  await db.folders.update(id, { name });
}

export async function deleteFolder(id: string) {
  // Move notes in this folder to "All Notes" (null folder)
  await db.notes.where('folderId').equals(id).modify({ folderId: null });
  await db.folders.delete(id);
}
