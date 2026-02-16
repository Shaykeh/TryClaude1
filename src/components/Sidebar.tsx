import { useState } from 'react';
import type { Folder } from '../db';
import { createFolder, renameFolder, deleteFolder } from '../hooks/useFolders';
import type { Theme } from '../hooks/useDarkMode';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  allTags: string[];
  activeFolderId: string | null;
  activeTagFilter: string | null;
  onSelectFolder: (id: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  theme: Theme;
  onSetTheme: (t: Theme) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  folders,
  allTags,
  activeFolderId,
  activeTagFilter,
  onSelectFolder,
  onSelectTag,
  theme,
  onSetTheme,
}: SidebarProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleRename = async (id: string) => {
    if (editingName.trim()) {
      await renameFolder(id, editingName.trim());
    }
    setEditingFolderId(null);
  };

  const handleDeleteFolder = async (id: string) => {
    if (confirm('Delete this folder? Notes will be moved to All Notes.')) {
      await deleteFolder(id);
      if (activeFolderId === id) onSelectFolder(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-200 ease-out shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full safe-top safe-bottom">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">QuickNote</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Folders */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Folders
                </h3>
                <button
                  onClick={() => setShowNewFolder(!showNewFolder)}
                  className="p-1 rounded text-gray-400 hover:text-blue-500"
                  aria-label="New folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {showNewFolder && (
                <div className="flex gap-1 mb-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="Folder name"
                    className="flex-1 text-sm px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-transparent outline-none focus:border-blue-500 text-gray-700 dark:text-gray-200"
                    autoFocus
                    aria-label="New folder name"
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="px-2 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* All Notes */}
              <button
                onClick={() => {
                  onSelectFolder(null);
                  onSelectTag(null);
                  onClose();
                }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm min-h-[44px] ${
                  !activeFolderId && !activeTagFilter
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                All Notes
              </button>

              {folders.map((folder) => (
                <div key={folder.id} className="group flex items-center">
                  {editingFolderId === folder.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleRename(folder.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(folder.id)}
                      className="flex-1 text-sm px-3 py-2 rounded border border-blue-500 bg-transparent outline-none text-gray-700 dark:text-gray-200"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => {
                        onSelectFolder(folder.id);
                        onSelectTag(null);
                        onClose();
                      }}
                      className={`flex-1 text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm min-h-[44px] ${
                        activeFolderId === folder.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                      {folder.name}
                    </button>
                  )}
                  <div className="hidden group-hover:flex items-center">
                    <button
                      onClick={() => {
                        setEditingFolderId(folder.id);
                        setEditingName(folder.name);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500"
                      aria-label="Rename folder"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      aria-label="Delete folder"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="px-4 pt-2 pb-2 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        onSelectTag(activeTagFilter === tag ? null : tag);
                        onSelectFolder(null);
                        onClose();
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        activeTagFilter === tag
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>

            {showSettings && (
              <div className="px-4 pb-3">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
                  Theme
                </label>
                <div className="flex gap-1">
                  {(['system', 'light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => onSetTheme(t)}
                      className={`flex-1 text-xs py-2 rounded-lg capitalize ${
                        theme === t
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
