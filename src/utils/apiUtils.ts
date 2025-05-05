/**
 * API utility functions for the AI Doc application
 */

/**
 * Interface for documentation generation request
 */
export interface GenerateDocumentationRequest {
  code: string;
  language: string;
  apiKey: string;
  standards?: string;
}

/**
 * Interface for documentation generation response
 */
export interface GenerateDocumentationResponse {
  documentation: string;
  improvedCode: string;
  originalCode: string;
  language: string;
}

/**
 * Generate documentation by calling the API
 * 
 * @param params Request parameters
 * @returns Promise with the generated documentation
 */
export const generateDocumentation = async (
  params: GenerateDocumentationRequest
): Promise<GenerateDocumentationResponse> => {
  const response = await fetch('/api/generate-documentation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || errorData.error || 'Failed to generate documentation');
  }

  return await response.json();
};

/**
 * Save API key to local storage
 * 
 * @param key The API key to save
 */
export const saveApiKey = (key: string): void => {
  localStorage.setItem('deepseekApiKey', key);
};

/**
 * Get API key from local storage
 * 
 * @returns The saved API key or empty string
 */
export const getApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('deepseekApiKey') || '';
};
