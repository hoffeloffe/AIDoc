import React, { useState, useEffect } from 'react';

interface ApiKeyBarProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

const ApiKeyBar: React.FC<ApiKeyBarProps> = ({ apiKey, onSaveApiKey }) => {
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    // Update input when apiKey prop changes
    setInputApiKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    if (!inputApiKey.trim()) {
      setMessage({ text: 'API key cannot be empty', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    // Save the API key
    try {
      onSaveApiKey(inputApiKey.trim());
      setIsEditing(false);
      setShowKey(false);
      setMessage({ text: 'API key saved successfully', type: 'success' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ text: 'Failed to save API key', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setInputApiKey(apiKey);
    setIsEditing(false);
    setShowKey(false);
    setMessage(null);
  };

  const getMaskedKey = () => {
    if (!apiKey) return '';
    return apiKey.substring(0, 3) + '•'.repeat(apiKey.length - 6) + apiKey.substring(apiKey.length - 3);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DeepSeek API Key</h3>
          
          {isEditing ? (
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                placeholder="Enter your DeepSeek API key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
              >
                {showKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              {apiKey ? (
                <div className="font-mono text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-600">
                  {getMaskedKey()}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No API key set. Add your DeepSeek API key to use your own account.
                </div>
              )}
            </div>
          )}
          
          {message && (
            <div className={`mt-2 text-sm ${
              message.type === 'success' ? 'text-green-600 dark:text-green-400' : 
              message.type === 'error' ? 'text-red-600 dark:text-red-400' : 
              'text-blue-600 dark:text-blue-400'
            }`}>
              {message.text}
            </div>
          )}
          
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Your API key is stored locally in your browser and is never sent to our servers.
            {!isEditing && (
              <> Get a key from <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">platform.deepseek.com</a></>
            )}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {apiKey ? 'Change API Key' : 'Add API Key'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyBar;
