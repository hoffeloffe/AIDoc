import axios from 'axios';

/**
 * Ensures imports are preserved in the improved code
 * @param originalCode - The original code with imports
 * @param improvedCode - The improved code that might be missing imports
 * @returns The improved code with all original imports preserved
 */
export function preserveImports(originalCode: string, improvedCode: string): string {
  // Extract imports from original code
  const importRegex = /^\s*import\s+.*?['"].*?['"];?\s*$/gm;
  const originalImports = originalCode.match(importRegex) || [];
  
  if (originalImports.length === 0) {
    // No imports to preserve
    return improvedCode;
  }
  
  // Check if improved code already has the imports
  const improvedImports = improvedCode.match(importRegex) || [];
  
  // If all imports are already present, return the improved code as is
  if (originalImports.length === improvedImports.length && 
      originalImports.every(imp => improvedImports.some(impImproved => 
        impImproved.trim().replace(/;$/, '') === imp.trim().replace(/;$/, '')
      ))) {
    return improvedCode;
  }
  
  // Add missing imports to the beginning of the improved code
  console.log('Adding missing imports to improved code');
  
  // Get the imports that are missing in the improved code
  const missingImports = originalImports.filter(imp => 
    !improvedImports.some(impImproved => 
      impImproved.trim().replace(/;$/, '') === imp.trim().replace(/;$/, '')
    )
  );
  
  // If the improved code already has some imports, remove them to avoid duplicates
  let codeWithoutImports = improvedCode;
  if (improvedImports.length > 0) {
    codeWithoutImports = improvedCode.replace(importRegex, '');
  }
  
  // Add all original imports to the beginning of the code
  return originalImports.join('\n') + '\n\n' + codeWithoutImports.trim();
}

/**
 * Extracts documentation and improved code from AI response
 * @param aiResponse - The raw AI response text
 * @returns Object containing documentation and improved code
 */
export function processAIResponse(aiResponse: string): { documentation: string; improvedCode: string } {
  try {
    // Default values
    let documentation = '';
    let improvedCode = '';

    // Check if response contains a clear documentation section
    if (aiResponse.includes('## Documentation') || aiResponse.includes('# Documentation')) {
      // Split the response at the documentation heading
      const docSplit = aiResponse.split(/(?:##|#)\s*Documentation/i);
      
      if (docSplit.length > 1) {
        documentation = docSplit[1].trim();
        
        // Check if there's an improved code section
        if (documentation.includes('## Improved Code') || documentation.includes('# Improved Code')) {
          const codeSplit = documentation.split(/(?:##|#)\s*Improved Code/i);
          documentation = codeSplit[0].trim();
          improvedCode = codeSplit[1].trim();
          
          // Remove markdown code block formatting if present
          improvedCode = improvedCode.replace(/```[\w]*\n([\s\S]*?)```/g, '$1').trim();
        }
      }
    } else {
      // If no clear documentation section, treat the entire response as documentation
      documentation = aiResponse.trim();
    }
    
    // Remove any markdown code block indicators in documentation
    documentation = documentation.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
    
    return { documentation, improvedCode };
  } catch (error) {
    console.error('Error processing AI response:', error);
    return { documentation: aiResponse, improvedCode: '' };
  }
}

// isValidCode function removed as it was unused

/**
 * Interface for AI documentation generation options
 */
export interface DocGenerationOptions {
  code: string;
  language?: string;
  apiKey: string;
  apiUrl: string;
  prompt?: string;
  codingStandards?: string[];
  temperature?: number;
}

/**
 * Generates documentation using the AI API
 * @param options - Documentation generation options
 * @returns Object containing documentation, improved code, and original code
 */
export async function generateDocumentation(options: DocGenerationOptions): Promise<{ documentation: string; improvedCode: string; originalCode: string }> {
  const { code, language, apiKey, apiUrl, prompt, codingStandards = [], temperature = 0.3 } = options;
  
  // Skip if no code provided
  if (!code.trim()) {
    throw new Error('Code is required');
  }
  
  // Format coding standards as context if available
  const ragContext = codingStandards.join('\n');
  
  // Create the base prompt
  let promptText = prompt || 
    "Add CONCISE JSDoc comments to the following code WITHOUT CHANGING THE CODE STRUCTURE OR FUNCTIONALITY. " +
    "DO NOT add new functions, variables, or error handling. DO NOT restructure the code. " +
    "ONLY add brief documentation comments to the existing code. " +
    "Keep the documentation brief and to the point. Use one-line JSDoc comments where possible. " +
    "PRESERVE ALL IMPORT STATEMENTS EXACTLY AS THEY APPEAR IN THE ORIGINAL CODE.";
  
  // Add coding standards context if available
  if (ragContext) {
    promptText += "\n\nApply the following coding standards to your documentation:\n" + ragContext;
  }
  
  // Add the code to analyze
  promptText += "\n\nCode to analyze and document:\n" + code;
  
  try {
    // Call the AI API
    const response = await axios.post(
      apiUrl,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: promptText,
          },
        ],
        temperature: temperature,
        max_tokens: 4000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    
    // Extract the AI response
    const aiResponse = response.data.choices[0].message.content;
    
    // Process the response to extract documentation and improved code
    const { documentation, improvedCode } = processAIResponse(aiResponse);
    
    // Ensure imports are preserved if improved code was generated
    const finalImprovedCode = improvedCode ? preserveImports(code, improvedCode) : '';
    
    return {
      documentation,
      improvedCode: finalImprovedCode,
      originalCode: code
    };
  } catch (error: any) {
    console.error('Error generating documentation:', error);
    throw error;
  }
}
