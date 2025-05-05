import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

interface DocumentationOutputProps {
  documentation: string;
  improvedCode: string;
  originalCode: string;
  isLoading: boolean;
  language?: string; // Optional language for syntax highlighting
}

const DocumentationOutput = ({  
  documentation, 
  improvedCode, 
  originalCode, 
  isLoading, 
  language = "javascript" 
}: DocumentationOutputProps) => {
  // Process the documentation to remove introductory text
  const processDocumentation = (text: string): string => {
    if (!text) return "";
    
    // Remove common intro phrases
    return text
      .replace(/^Here's the code with concise JSDoc comments added:(?:\s*\n)+/i, '')
      .replace(/^Here are the JSDoc comments for your code:(?:\s*\n)+/i, '')
      .replace(/^I've added JSDoc documentation to your code:(?:\s*\n)+/i, '')
      .replace(/^Here's your code with documentation:(?:\s*\n)+/i, '');
  };

  const [localDocumentation, setLocalDocumentation] = useState(
    processDocumentation(documentation) || ""
  );
  const [localImprovedCode, setLocalImprovedCode] = useState(improvedCode || "");
  
  // Effect to update local state when props change
  useEffect(() => {
    setLocalDocumentation(processDocumentation(documentation) || "");
    setLocalImprovedCode(improvedCode || "");
  }, [documentation, improvedCode]);

  return (
    <div className="code-editor-container relative h-full w-full overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}
      
      {documentation ? (
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={localDocumentation}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            theme: 'vs-dark',
            padding: { top: 16, bottom: 16 },
            scrollbar: {
              useShadows: false,
              verticalHasArrows: true,
              horizontalHasArrows: true,
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12,
              alwaysConsumeMouseWheel: false
            }
          }}
          theme="vs-dark"
        />
      ) : (
        <div className="flex justify-center items-center h-full">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md text-center border border-gray-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-blue-400 mb-2">Documentation Ready</h3>
            <p className="text-gray-400 mb-6">Generate documentation for your code by clicking the "Generate Documentation" button.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentationOutput;
