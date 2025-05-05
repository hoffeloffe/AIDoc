import React, { useState, useMemo, useCallback } from 'react';

// =========== TYPES AND INTERFACES ===========

export interface DocPage {
  id: string;
  title: string;
  timestamp: Date;
  code: string;
  type: 'technical' | 'user'; // Support for both technical and user documentation
  documentation: string;
  improvedCode: string;
  language?: string; // Detected programming language
  lastUpdated?: string; // ISO string timestamp of last update
}

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'language';

interface SidebarProps {
  pages: DocPage[];
  onPageSelect: (page: DocPage) => void;
  onPageDelete: (id: string) => void;
  onPageUpdate: (id: string, updates: Partial<DocPage>) => void;
  onNewPage: () => void;
  activePageId: string | null;
}

interface SidebarViewProps extends SidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  showSortOptions: boolean;
  setShowSortOptions: (show: boolean) => void;
  filteredPages: DocPage[];
  getLanguageIcon: (language?: string) => string;
  formatRelativeTime: (date: Date) => string;
}

// =========== CONSTANTS ===========

const LANGUAGE_ICONS: Record<string, string> = {
  javascript: '🟨',
  typescript: '🔷',
  python: '🐍',
  java: '☕',
  html: '🌐',
  css: '🎨',
  markdown: '📝',
};

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'a-z', label: 'A-Z' },
  { id: 'z-a', label: 'Z-A' },
  { id: 'language', label: 'Language' },
];

const DEFAULT_ICON = '📄';

// =========== UTILITY FUNCTIONS ===========

const getLanguageIcon = (language?: string): string => {
  if (!language) return DEFAULT_ICON;
  
  const langKey = Object.keys(LANGUAGE_ICONS).find(key => 
    language.toLowerCase().includes(key)
  );
  
  return langKey ? LANGUAGE_ICONS[langKey] : DEFAULT_ICON;
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
  }
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  }
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  }
  return 'Just now';
};

// =========== CONTAINER COMPONENT ===========

const Sidebar: React.FC<SidebarProps> = ({ pages, onPageSelect, onPageDelete, onPageUpdate, onNewPage, activePageId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortOptions, setShowSortOptions] = useState(false);

  const filteredPages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? pages.filter(page => 
          page.title.toLowerCase().includes(term) || 
          (page.language?.toLowerCase().includes(term)) ||
          page.type.toLowerCase().includes(term)
        )
      : [...pages];

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        case 'language':
          return (a.language || '').localeCompare(b.language || '');
        default:
          return 0;
      }
    });
  }, [pages, searchTerm, sortBy]);

  const handleSortOptionSelect = useCallback((option: SortOption) => {
    setSortBy(option);
    setShowSortOptions(false);
  }, []);

  return (
    <SidebarView
      pages={pages}
      onPageSelect={onPageSelect}
      onPageDelete={onPageDelete}
      onPageUpdate={onPageUpdate}
      onNewPage={onNewPage}
      activePageId={activePageId}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      sortBy={sortBy}
      setSortBy={handleSortOptionSelect}
      showSortOptions={showSortOptions}
      setShowSortOptions={setShowSortOptions}
      filteredPages={filteredPages}
      getLanguageIcon={getLanguageIcon}
      formatRelativeTime={formatRelativeTime}
    />
  );
};

// =========== PRESENTATIONAL COMPONENT (UI) ===========

const SidebarView: React.FC<SidebarViewProps> = ({
  onPageSelect,
  onPageDelete,
  onPageUpdate,
  onNewPage,
  activePageId,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  showSortOptions,
  setShowSortOptions,
  filteredPages,
  getLanguageIcon,
  formatRelativeTime
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const handlePageDelete = useCallback((id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      onPageDelete(id);
    }
  }, [onPageDelete]);
  
  const handleStartEditing = useCallback((id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  }, []);
  
  const handleSaveTitle = useCallback(() => {
    if (editingId && editTitle.trim()) {
      onPageUpdate(editingId, { title: editTitle.trim() });
      setEditingId(null);
    }
  }, [editingId, editTitle, onPageUpdate]);
  
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 flex flex-col">
      {/* Header section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {/* App Logo and Title */}
        <div className="flex items-center mb-4">
          <svg className="w-7 h-7 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
          </svg>
          <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">AI Doc</h1>
        </div>
        
        {/* New Documentation Button (Primary Action) */}
        <button 
          onClick={onNewPage}
          className="w-full py-2 px-4 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors shadow-sm"
          aria-label="Create new documentation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Documentation
        </button>
        
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-3 pl-9 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Search documentation"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          {/* Sort button */}
          <button
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="absolute right-8 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Sort options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
          
          {/* Clear search button */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Sort options dropdown */}
        {showSortOptions && (
          <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sort by:</p>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-md ${sortBy === option.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
                  aria-pressed={sortBy === option.id}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional space for UI balance */}
        <div className="mt-4"></div>
      </div>
      
      {/* Documentation Pages List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPages.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">
              {searchTerm ? 'No matching documentation found' : 'No documentation pages yet'}
            </p>
            <button
              onClick={onNewPage}
              className="mt-2 text-blue-500 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300"
            >
              Create your first documentation
            </button>
          </div>
        ) : (
          <ul className="px-2 py-3 space-y-1" role="list">
            {filteredPages.map((page) => (
              <li
                key={page.id}
                className={`relative px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 group hover:bg-gray-100 dark:hover:bg-gray-700 ${activePageId === page.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400' : ''}`}
                onClick={() => onPageSelect(page)}
                role="listitem"
              >
                {/* Page Title */}
                <div className="flex items-center text-gray-900 dark:text-gray-100 mb-1">
                  {editingId === page.id ? (
                    <div className="flex items-center w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-blue-400 dark:border-blue-500 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <div className="flex space-x-1 ml-1">
                        <button
                          onClick={handleSaveTitle}
                          className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title="Save"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Cancel"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span 
                      className="font-medium truncate mr-8 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" 
                      style={{ maxWidth: 'calc(100% - 1rem)' }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the onPageSelect
                        handleStartEditing(page.id, page.title);
                      }}
                      title="Click to edit title"
                    >
                      {page.title}
                    </span>
                  )}
                </div>
                
                {/* Metadata row */}
                <div className="flex justify-between items-center mt-0.5 text-xs">
                  {/* Timestamp */}
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">
                      {formatRelativeTime(page.timestamp)}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-xs bg-gray-800 text-gray-200 border border-gray-700">
                      {page.language || 'code'}
                    </span>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageDelete(page.id, page.title);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-opacity"
                    title="Delete"
                    aria-label={`Delete ${page.title}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-auto p-3 border-t border-gray-200 dark:border-gray-700 text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>© 2025 AI Doc</p>
          <p className="mt-1 flex items-center justify-center">
            <span className="mr-1">Powered by</span> 
            <span className="text-blue-500 dark:text-blue-400 font-medium">DeepSeek</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
