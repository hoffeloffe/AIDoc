import { NextResponse } from 'next/server';
import { detectLanguage } from '../../../utils/languageDetection';
import { generateDocumentation as generateDocs } from '../../../utils/codeHelper';

// Import coding standards using require to avoid TypeScript issues
const codingStandards = require('../../../data/coding_standards.json');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * API endpoint for generating code documentation using DeepSeek AI
 * @route POST /api/generate-documentation
 */
export async function POST(request: Request) {
  /**
   * Main POST handler for documentation generation
   * @param {string} code - The source code to document
   * @param {string} language - The programming language of the code
   */
  try {
    const { code, language: clientLanguage, apiKey: clientApiKey } = await request.json();
    
    // Validate API key is present
    if (!clientApiKey) {
      console.error('API key is missing from request');
      return NextResponse.json(
        { 
          error: 'API configuration error', 
          details: 'DeepSeek API key is missing. Please add your API key in the settings.'
        },
        { status: 500 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    // Use client-provided language or detect from code
    const language = clientLanguage || detectLanguage(code);
    
    // Get relevant coding standards from local JSON file
    const standards = (codingStandards as Record<string, string[]>)[language] || 
                     (codingStandards as Record<string, string[]>)['general'] || [];

    try {
      // Use the extracted utility function to generate documentation
      const result = await generateDocs({
        code,
        language,
        apiKey: clientApiKey, // Use the client-provided API key
        apiUrl: DEEPSEEK_API_URL,
        codingStandards: standards
      });
      
      // Return the processed response
      return NextResponse.json({
        documentation: result.documentation,
        improvedCode: result.improvedCode,
        originalCode: result.originalCode,
        language,
      });
    } catch (apiError: any) {
      console.error('API Error:', apiError.message);
      
      // Handle API-specific errors
      let errorMessage = 'Failed to generate documentation';
      let errorDetails = 'Please try again later';
      let errorStatus = 500;
      
      // Check if it's a rate limiting error
      if (apiError.response?.status === 429) {
        errorMessage = 'Rate limit exceeded';
        errorDetails = 'Too many requests. Please try again in a few minutes.';
        errorStatus = 429;
      }
      // Check if it's an authentication error
      else if (apiError.response?.status === 401) {
        errorMessage = 'API authentication failed';
        errorDetails = 'Invalid API key. Please check your DeepSeek API key.';
        errorStatus = 401;
      }
      // Check if it's a bad request
      else if (apiError.response?.status === 400) {
        errorMessage = 'Invalid request to AI service';
        errorDetails = apiError.response?.data?.error?.message || 'Please check your input and try again.';
        errorStatus = 400;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: errorDetails,
          status: errorStatus,
          timestamp: new Date().toISOString()
        },
        { status: errorStatus }
      );
    }
  } catch (error: any) {
    // Handle general errors
    console.error('General Error:', error);
    
    const errorStatus = 500;
    
    return NextResponse.json(
      { 
        error: 'Generation failed', 
        message: error.message || 'Unknown error',
        status: errorStatus,
        timestamp: new Date().toISOString()
      }, 
      { status: errorStatus }
    );
  }
}
