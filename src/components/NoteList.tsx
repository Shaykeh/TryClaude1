import type { Note } from '../db';
import type { Folder } from '../db';

interface NoteListProps {
  notes: Note[];
  folders: Folder[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function getPreview(content: string): string {
  const lines = content.split('\n').filter((l) => l.trim());
  return lines.slice(0, 2).join(' ').slice(0, 100) || 'Empty note';
}

export function NoteList({
  notes,
  folders,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  onTogglePin,
}: NoteListProps) {
  const folderMap = new Map(folders.map((f) => [f.id, f.name]));

  return (
    <div className="flex-1 overflow-y-auto">
      {notes.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm">No notes yet</p>
        </div>
      )}
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelectNote(note.id)}
          className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors ${
            selectedNoteId === note.id
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          aria-label={`Note: ${note.title || 'Untitled'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {note.isPinned && (
                  <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                  </svg>
                )}
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {note.title || 'Untitled'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {getPreview(note.content)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(note.updatedAt)}
                </span>
                {note.folderId && folderMap.has(note.folderId) && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                    {folderMap.get(note.folderId)}
                  </span>
                )}
                {note.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(note.id, note.isPinned);
                }}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400"
                aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
              >
                <svg className="w-4 h-4" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500"
                aria-label="Delete note"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
