import React, { useState, useEffect } from 'react';

interface CodingStandardsProps {
  standards: string;
  onSaveStandards: (standards: string) => void;
}

/**
 * CodingStandards component allows users to define custom documentation standards
 * that will be applied when generating documentation for their code.
 */
const CodingStandards: React.FC<CodingStandardsProps> = ({ 
  standards, 
  onSaveStandards 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [standardsText, setStandardsText] = useState(standards || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'templates'>('preview');
  const [currentTemplate, setCurrentTemplate] = useState<string>('custom');

  // Update local state when prop changes
  useEffect(() => {
    setStandardsText(standards);
    
    // Try to detect which template is being used
    if (standards) {
      const matchedTemplate = Object.entries(templates).find(([_, content]) => 
        content.trim() === standards.trim()
      );
      
      if (matchedTemplate) {
        setCurrentTemplate(matchedTemplate[0]);
      } else {
        setCurrentTemplate('custom');
      }
    }
  }, [standards]);

  const handleSave = () => {
    onSaveStandards(standardsText);
    setIsEditing(false);
    setActiveTab('preview');
  };

  const handleCancel = () => {
    setStandardsText(standards);
    setIsEditing(false);
    setActiveTab('preview');
  };

  const applyTemplate = (template: string, templateName: string) => {
    setStandardsText(template);
    setCurrentTemplate(templateName);
    setActiveTab('edit');
  };

  // Sample standards templates to help users get started
  const templates = {
    basic: `# Basic Documentation Standards

- Include a brief description of each function/method
- Document parameters and return values
- Note any potential errors or exceptions`,

    comprehensive: `# Comprehensive Documentation Standards

## Function Documentation
- Description of purpose and functionality
- Parameters with types and descriptions
- Return values with types and descriptions
- Examples of usage
- Edge cases and error handling

## Code Style
- Use consistent naming conventions
- Keep functions small and focused
- Document complex algorithms
- Include version history for major changes`,

    technical: `# Technical Documentation Guidelines

- Follow JSDoc/TSDoc format for all functions and classes
- Document all public APIs and interfaces
- Include complexity analysis (Big O) for critical algorithms
- Note any performance considerations or optimizations
- Document threading/concurrency implications
- Include architectural diagrams for complex systems`,

    user: `# User-Friendly Documentation Standards

- Focus on explaining "why" not just "what"
- Use clear, concise language avoiding technical jargon
- Include real-world examples and use cases
- Document UI components and their interactions
- Provide troubleshooting tips for common issues
- Include screenshots or diagrams where helpful`
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header with collapsible toggle */}
      <div 
        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
            Coding Standards
            {standards && (
              <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded capitalize">
                {currentTemplate} template
              </span>
            )}
            {!isEditing && (
              <svg xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ml-2 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </h3>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setIsExpanded(true);
                setActiveTab('edit');
              }}
              className="text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              title="Edit your coding standards"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </div>
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                title="Save your changes"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </div>
              </button>
              <button
                onClick={handleCancel}
                className="text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                title="Cancel editing"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content area - only visible when expanded */}
      {(isExpanded || isEditing) && (
        <div className="p-4">
          {isEditing ? (
            <div>
              {/* Tabs for Edit mode */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button 
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'edit' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                  onClick={() => setActiveTab('edit')}
                >
                  Edit
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'templates' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                  onClick={() => setActiveTab('templates')}
                >
                  Templates
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'preview' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                  onClick={() => setActiveTab('preview')}
                >
                  Preview
                </button>
              </div>

              {activeTab === 'edit' && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Documentation Standards
                  </label>
                  <textarea
                    value={standardsText}
                    onChange={(e) => setStandardsText(e.target.value)}
                    className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md 
                              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                              focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Enter your coding standards and documentation preferences here..."
                    aria-label="Coding standards textarea"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    These standards will guide how the AI generates documentation for your code. 
                    Be specific about format, terminology, and level of detail you prefer.
                  </p>
                </div>
              )}

              {activeTab === 'templates' && (
                <div>
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose a template to get started
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(templates).map(([key, content]) => (
                        <div 
                          key={key}
                          className="border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
                          onClick={() => applyTemplate(content, key)}
                        >
                          <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1 capitalize">{key} Template</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{content.split('\n').slice(0, 2).join(' ')}</p>
                          <button className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                            Use this template
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <p>After selecting a template, you can customize it to fit your specific needs.</p>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="prose dark:prose-invert max-w-none p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                  {standardsText ? (
                    <div className="whitespace-pre-wrap">{standardsText}</div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No standards content to preview. Switch to the Edit tab to add content.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {standards ? (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{standards}</div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">
                    No coding standards defined yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mx-auto mt-1">
                    Define your documentation style preferences to help the AI generate more consistent documentation
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setActiveTab('templates');
                    }}
                    className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors duration-150 ease-in-out shadow-sm"
                  >
                    Choose a Template
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Info tooltip - only shown when collapsed */}
      {!isExpanded && !isEditing && (
        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          {standards ? 'Click to view your documentation standards' : 'Click to add documentation standards'}
        </div>
      )}
    </div>
  );
};

export default CodingStandards;
