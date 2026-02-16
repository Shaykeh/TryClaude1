import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { updateNote } from '../hooks/useNotes';

interface NoteEditorProps {
  noteId: string;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export function NoteEditor({ noteId, onBack, onDelete }: NoteEditorProps) {
  const note = useLiveQuery(() => db.notes.get(noteId), [noteId]);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (note && !initialized.current) {
      setContent(note.content);
      setTags(note.tags.join(', '));
      initialized.current = true;
    }
  }, [note]);

  // Reset when noteId changes
  useEffect(() => {
    initialized.current = false;
  }, [noteId]);

  const autoSave = useCallback(
    (newContent: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const title = newContent.split('\n')[0]?.trim().slice(0, 100) || 'Untitled';
        updateNote(noteId, { content: newContent, title });
      }, 300);
    },
    [noteId],
  );

  const handleContentChange = (value: string) => {
    setContent(value);
    autoSave(value);
  };

  const handleSaveTags = () => {
    const parsed = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateNote(noteId, { tags: parsed });
    setShowTagInput(false);
  };

  const handleTogglePin = () => {
    if (note) {
      updateNote(noteId, { isPinned: !note.isPinned });
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 safe-top">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-blue-500 hover:text-blue-600 min-h-[44px] px-1"
          aria-label="Back to notes"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Notes</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePin}
            className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center ${
              note.isPinned
                ? 'text-blue-500'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <svg className="w-5 h-5" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
            </svg>
          </button>

          <button
            onClick={() => setShowTagInput(!showTagInput)}
            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Edit tags"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(noteId)}
            className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500"
            aria-label="Delete note"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tag input bar */}
      {showTagInput && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          </svg>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            onBlur={handleSaveTags}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTags()}
            placeholder="Add tags (comma separated)"
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
            aria-label="Tags"
          />
        </div>
      )}

      {/* Tags display */}
      {note.tags.length > 0 && !showTagInput && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Start typing..."
        className="flex-1 w-full px-4 py-3 text-base leading-relaxed bg-transparent outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 safe-bottom"
        autoFocus
        aria-label="Note content"
      />

      {/* Footer with timestamp */}
      <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700">
        Created {new Date(note.createdAt).toLocaleString()} · Modified{' '}
        {new Date(note.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
