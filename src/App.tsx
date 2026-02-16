import { useState, useCallback } from 'react';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useNotes, createNote, deleteNote, togglePin, updateNote, type SortOrder } from './hooks/useNotes';
import { useFolders } from './hooks/useFolders';
import { useAllTags } from './hooks/useAllTags';
import { useDarkMode } from './hooks/useDarkMode';

export function App() {
  const { theme, setTheme } = useDarkMode();

  // Navigation state
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter/sort state
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('updatedAt');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Folder picker
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [folderPickerNoteId, setFolderPickerNoteId] = useState<string | null>(null);

  // Data
  const notes = useNotes(activeFolderId, activeTagFilter, searchQuery, sortOrder);
  const folders = useFolders();
  const allTags = useAllTags();

  const handleCreateNote = useCallback(async () => {
    const id = await createNote(activeFolderId);
    setSelectedNoteId(id);
  }, [activeFolderId]);

  const handleDeleteNote = useCallback((id: string) => {
    setDeleteTarget(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteTarget) {
      await deleteNote(deleteTarget);
      if (selectedNoteId === deleteTarget) setSelectedNoteId(null);
      setDeleteTarget(null);
    }
  }, [deleteTarget, selectedNoteId]);

  const handleTogglePin = useCallback(async (id: string, isPinned: boolean) => {
    await togglePin(id, isPinned);
  }, []);

  const handleMoveToFolder = useCallback(async (noteId: string, folderId: string | null) => {
    await updateNote(noteId, { folderId });
    setShowFolderPicker(false);
    setFolderPickerNoteId(null);
  }, []);

  const getTitle = () => {
    if (activeTagFilter) return `#${activeTagFilter}`;
    if (activeFolderId) {
      const folder = folders.find((f) => f.id === activeFolderId);
      return folder?.name ?? 'All Notes';
    }
    return 'All Notes';
  };

  // Editor view
  if (selectedNoteId) {
    return (
      <div className="h-full bg-white dark:bg-gray-900">
        <NoteEditor
          noteId={selectedNoteId}
          onBack={() => setSelectedNoteId(null)}
          onDelete={handleDeleteNote}
        />
        <ConfirmDialog
          isOpen={deleteTarget !== null}
          title="Delete Note"
          message="This note will be permanently deleted. This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        folders={folders}
        allTags={allTags}
        activeFolderId={activeFolderId}
        activeTagFilter={activeTagFilter}
        onSelectFolder={setActiveFolderId}
        onSelectTag={setActiveTagFilter}
        theme={theme}
        onSetTheme={setTheme}
      />

      {/* Header */}
      <header className="px-4 pt-3 pb-2 safe-top">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Sort notes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
              </button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 overflow-hidden">
                    {([
                      ['updatedAt', 'Last Modified'],
                      ['createdAt', 'Date Created'],
                      ['alpha', 'Alphabetical'],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSortOrder(key);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm ${
                          sortOrder === key
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {label}
                        {sortOrder === key && ' ✓'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </header>

      <div className="px-4 py-1.5 text-xs text-gray-400 dark:text-gray-500">
        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
      </div>

      <NoteList
        notes={notes}
        folders={folders}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onDeleteNote={handleDeleteNote}
        onTogglePin={handleTogglePin}
      />

      {/* FAB — Create Note */}
      <button
        onClick={handleCreateNote}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center safe-bottom transition-transform active:scale-95"
        aria-label="Create new note"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Folder picker dialog */}
      {showFolderPicker && folderPickerNoteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-lg p-4 pb-8 safe-bottom">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Move to Folder</h3>
            <button
              onClick={() => handleMoveToFolder(folderPickerNoteId, null)}
              className="w-full text-left px-4 py-3 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              All Notes (no folder)
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => handleMoveToFolder(folderPickerNoteId, f.id)}
                className="w-full text-left px-4 py-3 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {f.name}
              </button>
            ))}
            <button
              onClick={() => {
                setShowFolderPicker(false);
                setFolderPickerNoteId(null);
              }}
              className="w-full mt-2 py-3 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Note"
        message="This note will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
