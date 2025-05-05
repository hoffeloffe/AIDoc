/**
 * Utility functions for documentation management
 */
import { DocPage } from '../components/Sidebar';

/**
 * Generate a unique ID for documentation pages
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Create a timestamp for a new documentation page
 */
export const createTimestamp = (): Date => {
  return new Date();
};

/**
 * Create a new blank documentation page
 */
export const createNewDocPage = (index: number): DocPage => {
  return {
    id: generateId(),
    title: `Documentation ${index + 1}`,
    code: '',
    documentation: '',
    language: 'javascript',
    timestamp: createTimestamp(),
    improvedCode: '',
    type: 'technical'
  };
};

/**
 * Extract a title from documentation content
 * @param documentation The documentation content
 * @returns A title extracted from the first line
 */
export const extractTitleFromDocumentation = (documentation: string): string => {
  if (!documentation) return '';
  
  const firstLine = documentation.split('\n')[0];
  return firstLine.replace(/^#+\s*/, '').substring(0, 30);
};

/**
 * Format relative time for display in the UI
 */
export const formatRelativeTime = (date: Date): string => {
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
