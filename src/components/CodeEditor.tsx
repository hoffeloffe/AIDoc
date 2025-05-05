import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  isLoading?: boolean;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, isLoading = false, language = 'javascript' }) => {
  return (
    <div className="code-editor-container relative h-full w-full overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}
      <Editor
        height="100%"
        defaultLanguage={language}
        value={code}
        onChange={(value) => !isLoading && setCode(value || '')}
        options={{
          readOnly: isLoading,
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
    </div>
  );
};

export default CodeEditor;
