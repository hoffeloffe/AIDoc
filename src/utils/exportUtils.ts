/**
 * Utility functions for exporting documentation in various formats
 */

/**
 * Download content as a text file
 * @param content The content to download
 * @param fileName The name of the file to download
 * @param fileType The type of file (extension)
 */
export const downloadAsFile = (content: string, fileName: string, fileType: string = 'md'): void => {
  // Create a blob with the content
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.${fileType}`;
  
  // Append to the document
  document.body.appendChild(a);
  
  // Trigger a click on the element
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Format documentation for markdown export
 * @param title The document title
 * @param documentation The documentation content
 * @param code The original code
 * @param improvedCode The documented code (if available)
 * @param language The programming language
 */
export const formatDocumentationForExport = (
  title: string,
  documentation: string,
  code: string,
  improvedCode?: string,
  language?: string
): string => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let content = `# ${title}\n\n`;
  content += `Generated on: ${timestamp}\n\n`;
  
  // Add the documentation section
  content += `## Documentation\n\n${documentation}\n\n`;
  
  // Add the original code section
  content += `## Original Code\n\n\`\`\`${language || ''}\n${code}\n\`\`\`\n\n`;
  
  // Add the improved code section if available
  if (improvedCode && improvedCode.trim() !== code.trim()) {
    content += `## Documented Code\n\n\`\`\`${language || ''}\n${improvedCode}\n\`\`\`\n\n`;
  }
  
  return content;
};

// PDF export functionality removed as it was unused
