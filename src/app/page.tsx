'use client';

import React, { useEffect, useState, useRef } from 'react';
import CodeEditor from '../components/CodeEditor';
import DocumentationOutput from '../components/DocumentationOutput';
import Sidebar, { DocPage } from '../components/Sidebar';
import ApiKeyBar from '../components/ApiKeyBar';
import CodingStandards from '../components/CodingStandards';
import { detectLanguage, getMonacoLanguage } from '../utils/languageDetection';
import { generateId, createTimestamp, createNewDocPage, extractTitleFromDocumentation } from '../utils/documentationUtils';
import { showTemporaryNotification as showNotification, getErrorMessage } from '../utils/uiUtils';
import { generateDocumentation, getApiKey, saveApiKey } from '../utils/apiUtils';
import { downloadAsFile, formatDocumentationForExport } from '../utils/exportUtils';

export default function Home() {
  // State for API key
  const [apiKey, setApiKey] = useState('');
  
  // State for code and documentation
  const [sourceCode, setSourceCode] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('javascript');
  const [monacoLanguage, setMonacoLanguage] = useState('javascript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotificationState, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showMobileLanguageDropdown, setShowMobileLanguageDropdown] = useState(false);
  const [showDesktopLanguageDropdown, setShowDesktopLanguageDropdown] = useState(false);
  
  // Supported programming languages with their icons and Monaco editor IDs
  const SUPPORTED_LANGUAGES = [
    { id: 'javascript', name: 'JavaScript', monaco: 'javascript' },
    { id: 'typescript', name: 'TypeScript', monaco: 'typescript' },
    { id: 'python', name: 'Python', monaco: 'python' },
    { id: 'java', name: 'Java', monaco: 'java' },
    { id: 'csharp', name: 'C#', monaco: 'csharp' },
    { id: 'cpp', name: 'C++', monaco: 'cpp' },
    { id: 'go', name: 'Go', monaco: 'go' },
    { id: 'rust', name: 'Rust', monaco: 'rust'},
    { id: 'php', name: 'PHP', monaco: 'php' },
    { id: 'ruby', name: 'Ruby', monaco: 'ruby'},
    { id: 'swift', name: 'Swift', monaco: 'swift' },
    { id: 'kotlin', name: 'Kotlin', monaco: 'kotlin' },
    { id: 'html', name: 'HTML', monaco: 'html' },
    { id: 'css', name: 'CSS', monaco: 'css' },
  ];
  
  // State for documentation pages (similar to DeepSeek Chat)
  const [docPages, setDocPages] = useState<DocPage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  // Optional coding standards selection
  const [codingStandards, setCodingStandards] = useState('');
  const [showStandards, setShowStandards] = useState(false);
  
  // For handling page updates
  const handlePageUpdate = (id: string, updates: Partial<DocPage>) => {
    setDocPages(prev => prev.map(page => 
      page.id === id ? { ...page, ...updates } : page
    ));
  };

  // Check for stored API key on component mount
  useEffect(() => {
    const storedKey = getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    }
    
    // Initialize with a blank documentation page
    const initialId = generateId();
    const initialPage = createNewDocPage(0);
    initialPage.id = initialId;
    initialPage.title = 'New Documentation'; // Custom title for first page
    
    setDocPages([initialPage]);
    setActivePageId(initialId);
  }, []);

  // Update detected language when code changes
  useEffect(() => {
    if (sourceCode.trim()) {
      const language = detectLanguage(sourceCode);
      setDetectedLanguage(language);
      setMonacoLanguage(getMonacoLanguage(language));
    }
  }, [sourceCode]);
  
  // Add keyboard shortcut support and click outside handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to generate documentation
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleGenerateDocumentation();
      }
      
      // Escape to close dropdowns and clear error
      if (e.key === 'Escape') {
        if (error) setError(null);
        if (showMobileLanguageDropdown) setShowMobileLanguageDropdown(false);
        if (showDesktopLanguageDropdown) setShowDesktopLanguageDropdown(false);
      }
    };
    
    // Handle clicks outside of the language dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if ((showMobileLanguageDropdown || showDesktopLanguageDropdown) && 
          !(e.target as Element).closest('.language-dropdown-container')) {
        setShowMobileLanguageDropdown(false);
        setShowDesktopLanguageDropdown(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [error, sourceCode, showMobileLanguageDropdown, showDesktopLanguageDropdown]);

  // Handle code change
  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    // Ensure we always have a string to avoid TypeScript errors
    setSourceCode(newCode);
    
    // Update the active document with the new code
    if (activePageId) {
      handlePageUpdate(activePageId, { code: newCode });
    }
    
    // Only detect language if we have enough code to analyze
    if (newCode.trim().length > 30) {
      // Use the language detection utility to auto-detect the language
      const detectedLang = detectLanguage(newCode);
      if (detectedLang !== 'general') {
        setDetectedLanguage(detectedLang);
        setMonacoLanguage(getMonacoLanguage(detectedLang));
        
        // If there's an active page, update its language
        if (activePageId) {
          handlePageUpdate(activePageId, {
            language: detectedLang
          });
        }
      }
    } else if (newCode.trim() === '') {
      // Reset to JavaScript for empty input
      setDetectedLanguage('javascript');
      setMonacoLanguage('javascript');
    }
  };

  // Handle API key change
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    saveApiKey(key);
  };

  // Create a new blank documentation page
  const handleNewPage = () => {
    const newPage = createNewDocPage(docPages.length);
    
    setDocPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    setSourceCode('');
    setError(null);
    
    // Show feedback
    displayNotification('Created new documentation page');
  };

  // Select an existing documentation page
  const handleSelectPage = (page: DocPage) => {
    setActivePageId(page.id);
    setSourceCode(page.code);
    // Handle language safely to avoid TypeScript errors
    const lang = page.language || 'javascript';
    setDetectedLanguage(lang);
    setMonacoLanguage(getMonacoLanguage(lang));
    setError(null);
  };

  // Delete a documentation page
  const handleDeletePage = (id: string) => {
    // Get the page title before deleting it
    const pageToDelete = docPages.find(page => page.id === id);
    const pageTitle = pageToDelete?.title || 'page';
    
    setDocPages(prev => prev.filter(page => page.id !== id));
    
    // If the active page was deleted, select the first available page
    if (activePageId === id && docPages.length > 1) {
      const remainingPages = docPages.filter(page => page.id !== id);
      setActivePageId(remainingPages[0].id);
      setSourceCode(remainingPages[0].code);
      // Handle potentially undefined language
      const lang = remainingPages[0].language || 'javascript';
      setDetectedLanguage(lang);
      setMonacoLanguage(getMonacoLanguage(lang));
    } else if (docPages.length === 1) {
      // If last page was deleted, create a new blank page
      handleNewPage();
    }
    
    // Show feedback
    displayNotification(`Deleted "${pageTitle}"`);
  };

  // Display a notification
  const displayNotification = (message: string) => {
    showNotification(message, setNotificationMessage, setShowNotification);
  };
  
  // Generate documentation
  const handleGenerateDocumentation = async () => {
    if (!sourceCode.trim()) {
      setError('Please enter some code to document.');
      return;
    }

    if (!apiKey) {
      setError('Please enter your DeepSeek API key.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    displayNotification('Generating documentation...');

    try {
      // Call the API using our utility function
      const data = await generateDocumentation({
        code: sourceCode,
        language: detectedLanguage,
        apiKey,
        standards: codingStandards
      });
      
      // Update the active document with the generated documentation
      if (activePageId) {
        // First update the content
        handlePageUpdate(activePageId, { 
          documentation: data.documentation,
          improvedCode: data.improvedCode || '',
          language: data.language || detectedLanguage,
          lastUpdated: new Date().toISOString()
        });
        
        // Then update the title based on documentation
        const title = extractTitleFromDocumentation(data.documentation);
        
        if (title) {
          handlePageUpdate(activePageId, { title });
        }
        
        displayNotification('Documentation generated successfully');
      }
    } catch (err: any) {
      console.error('Error generating documentation:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  // Get the active document
  const activePage = activePageId ? docPages.find(p => p.id === activePageId) : null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process the selected file
  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const content = await readFileContent(file);
      setSourceCode(content);
      
      // Auto-detect language from file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const languageMap: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'java': 'java',
        'cs': 'csharp',
        'cpp': 'cpp',
        'go': 'go',
        'rs': 'rust',
        'php': 'php',
        'rb': 'ruby',
        'swift': 'swift',
        'kt': 'kotlin',
        'html': 'html',
        'css': 'css'
      };
      
      const detectedLang = languageMap[fileExtension] || detectLanguage(content);
      setDetectedLanguage(detectedLang);
      setMonacoLanguage(getMonacoLanguage(detectedLang));
      
      // Show notification
      setNotificationMessage(`File ${file.name} loaded successfully`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(`Error reading file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  };

  return (
    <div className="flex flex-col h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Notification - Modern Toast Style */}
      {showNotificationState && (
        <div className="absolute top-16 right-4 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in-out z-50 flex items-center space-x-2 border border-blue-500/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{notificationMessage}</span>
        </div>
      )}
      
      
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <Sidebar 
          pages={docPages}
          activePageId={activePageId}
          onPageSelect={handleSelectPage}
          onPageDelete={handleDeletePage}
          onPageUpdate={handlePageUpdate}
          onNewPage={handleNewPage}
        />
        
        <div className="flex-1 flex flex-col p-5 overflow-hidden bg-gray-900">
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileSelected}
            accept=".js,.ts,.py,.java,.cs,.cpp,.go,.rs,.php,.rb,.swift,.kt,.html,.css,.txt"
          />
          {/* API Key Bar */}
          <ApiKeyBar apiKey={apiKey} onSaveApiKey={handleSaveApiKey} />
          
          {/* Coding standards */}
          <div className="mb-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <button
                  onClick={() => setShowStandards(!showStandards)}
                  className="group text-sm text-gray-400 hover:text-gray-200 mr-2 flex items-center transition-colors"
                  title={showStandards ? "Hide coding standards" : "Show coding standards"}
                >
                  <svg className="w-4 h-4 mr-1 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Coding Standards {showStandards ? "(Click to hide)" : "(Click to show)"}
                </button>
                <div className="flex-1"></div>
                <div className="text-xs text-indigo-300 bg-indigo-900 border border-indigo-700 px-2 py-0.5 rounded mr-2 flex items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-1.5"></span>
                  Technical Template
                </div>
                <button
                  onClick={() => setShowStandards(!showStandards)}
                  className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-800 transition-colors"
                  title="Edit standards"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {showStandards ? (
              <CodingStandards 
                standards={codingStandards}
                onSaveStandards={setCodingStandards}
              />
            ) : (
              <div className="text-xs text-gray-400 mt-2 border border-gray-700 rounded-md p-3 bg-gray-800 shadow-inner">
                <p className="mb-1"><span className="font-medium text-blue-400">Documentation standards</span> help the AI generate better quality documentation.</p>
                <p>Click the <span className="text-blue-400">Coding Standards</span> button above to customize how your code is documented.</p>
              </div>
            )}
          </div>
          
          {/* Instruction text */}
          <div className="text-center mb-5 max-w-2xl mx-auto">
            <h2 className="text-base font-medium bg-gradient-to-r from-blue-300 to-indigo-300 text-transparent bg-clip-text mb-1">Transform Your Code with AI-Powered Documentation</h2>
            <p className="text-gray-400 mb-3 text-xs">Get readable, standardized documentation instantly for any programming language</p>
            
            <div className="flex flex-row justify-center gap-3 text-xs">
              <div className="flex flex-row items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/30 shadow-sm">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-900/30 text-blue-300 font-bold text-xs">1</span>
                <span className="text-gray-300">Add Your Code</span>
              </div>
              
              <div className="flex flex-row items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/30 shadow-sm">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-900/30 text-blue-300 font-bold text-xs">2</span>
                <span className="text-gray-300">Generate Docs</span>
              </div>
              
              <div className="flex flex-row items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/30 shadow-sm">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-900/30 text-blue-300 font-bold text-xs">3</span>
                <span className="text-gray-300">Use & Save</span>
              </div>
            </div>
          </div>
          
          {/* Generate button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleGenerateDocumentation}
              disabled={isGenerating}
              title="Press Ctrl+Enter as a shortcut to generate documentation"
              className={`group px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500/30 focus:outline-none rounded-lg text-white flex items-center space-x-2 shadow-md transition-all duration-200 ${isGenerating ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white/90 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Generating Documentation...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-sm font-medium">Generate Smart Documentation</span>
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">Ctrl+Enter</span>
                </>
              )}
            </button>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-5 bg-red-900/30 backdrop-blur-sm border border-red-500/50 text-red-300 px-5 py-4 rounded-lg flex items-start shadow-lg transform transition-all duration-300">
              <div className="mr-3 mt-0.5 flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-200 mb-1 text-base">Error occurred</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button 
                className="ml-auto bg-transparent hover:bg-red-800/50 text-red-300 rounded-full p-1.5 transition-colors" 
                onClick={() => setError(null)}
                title="Dismiss error"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-6 overflow-hidden flex-1">
            <div className="flex items-center py-2 px-4 bg-gray-800 rounded-t-lg lg:hidden">
              <div className="flex-1">
                <h2 className="text-sm font-medium text-gray-300">Code Input</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleFileUpload}
                  className="flex items-center text-xs bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-white py-1.5 px-3 rounded-md transition-colors shadow-md" 
                  title="Upload your code from a file"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload
                </button>
                <div className="relative language-dropdown-container">
                  <button 
                    onClick={() => setShowMobileLanguageDropdown(!showMobileLanguageDropdown)}
                    className="flex items-center text-xs bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 focus:outline-none text-white py-1.5 px-3 rounded-md transition-colors shadow-md border border-transparent hover:border-gray-600" 
                    title="Select programming language"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="font-medium">
                      {SUPPORTED_LANGUAGES.find(lang => lang.monaco === monacoLanguage)?.name || monacoLanguage}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showMobileLanguageDropdown && (
                    <div className="absolute z-10 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 right-0">
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <button
                          key={lang.id}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors ${monacoLanguage === lang.monaco ? 'bg-blue-600/20 text-blue-300' : 'text-gray-300 hover:bg-gray-700'}`}
                          onClick={() => {
                            setDetectedLanguage(lang.id);
                            setMonacoLanguage(lang.monaco);
                            setShowMobileLanguageDropdown(false);
                            // If there's an active page, update its language
                            if (activePageId) {
                              handlePageUpdate(activePageId, {
                                language: lang.id
                              });
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <span className="ml-2">{lang.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Code Editor Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="hidden lg:flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold">1</span>
                  Code Input
                </h2>
                <div className="flex items-center">
                  <button 
                    onClick={handleFileUpload}
                    className="flex items-center text-xs bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-white py-1.5 px-3 rounded-md mr-2 transition-colors shadow-md" 
                    title="Upload code from a file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload
                  </button>
                  <div className="relative language-dropdown-container">
                    <button 
                      onClick={() => setShowDesktopLanguageDropdown(!showDesktopLanguageDropdown)}
                      className="flex items-center text-xs bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 focus:outline-none text-white py-1.5 px-3 rounded-md transition-colors shadow-md border border-transparent hover:border-gray-600" 
                      title="Select programming language"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span className="font-medium">
                        {SUPPORTED_LANGUAGES.find(lang => lang.monaco === monacoLanguage)?.name || monacoLanguage}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showDesktopLanguageDropdown && (
                      <div className="absolute z-10 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 right-0">
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <button
                            key={lang.id}
                            className={`w-full text-left px-4 py-2 text-xs transition-colors ${monacoLanguage === lang.monaco ? 'bg-blue-600/20 text-blue-300' : 'text-gray-300 hover:bg-gray-700'}`}
                            onClick={() => {
                              setDetectedLanguage(lang.id);
                              setMonacoLanguage(lang.monaco);
                              setShowMobileLanguageDropdown(false);
                              // If there's an active page, update its language
                              if (activePageId) {
                                handlePageUpdate(activePageId, {
                                  language: lang.id
                                });
                              }
                            }}
                          >
                            <div className="flex items-center">
                              <span className="ml-2">{lang.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden rounded-xl shadow-xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-gray-700/30 transform transition-all duration-300 hover:shadow-indigo-900/20">
                <CodeEditor
                  code={sourceCode}
                  setCode={handleCodeChange}
                  language={monacoLanguage}
                  isLoading={isGenerating}
                />
              </div>
            </div>
            
            {/* Documentation Output Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
                  Documentation Output
                </h2>
                {activePage?.documentation && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        if (!activePage?.documentation) return;
                        const title = activePage.documentation.substring(0, 30).replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") || "documentation";
                        const exportContent = formatDocumentationForExport(
                          title,
                          activePage.documentation,
                          activePage.code,
                          activePage.improvedCode,
                          activePage.language || "javascript"
                        );
                        downloadAsFile(exportContent, title);
                      }}
                      className="flex items-center text-xs bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none text-white py-1.5 px-3 rounded-md mr-2 transition-colors shadow-md"
                      title="Download as Markdown"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button 
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300 focus:outline-none transition-colors" 
                      title="Copy documentation to clipboard"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden rounded-xl shadow-xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-gray-700/30 transform transition-all duration-300 hover:shadow-blue-900/20">
                <DocumentationOutput
                  documentation={activePage?.documentation || ''}
                  improvedCode={activePage?.improvedCode || ''}
                  originalCode={activePage?.code || ''}
                  language={activePage?.language || 'javascript'}
                  isLoading={isGenerating}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
