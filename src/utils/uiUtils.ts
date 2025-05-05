/**
 * UI utility functions for the AI Doc application
 */
import { Dispatch, SetStateAction } from 'react';

/**
 * Type definition for notification messages
 */
export interface NotificationMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

/**
 * Show a temporary notification message
 * 
 * @param message The message to display
 * @param setNotificationMessage The state setter for the notification message
 * @param setShowNotification The state setter for the notification visibility
 * @param duration How long to show the message (ms)
 */
export const showTemporaryNotification = (
  message: string,
  setNotificationMessage: Dispatch<SetStateAction<string>>,
  setShowNotification: Dispatch<SetStateAction<boolean>>,
  duration: number = 3000
): void => {
  setNotificationMessage(message);
  setShowNotification(true);
  
  setTimeout(() => {
    setShowNotification(false);
  }, duration);
};

/**
 * Get a human-readable error message from an API error
 * 
 * @param error The error object
 * @returns A human-readable error message
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.details) {
    return error.response.data.details;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Create CSS class names based on conditions
 * 
 * @param classes Object with class names as keys and booleans as values
 * @returns A string of class names
 */
export const classNames = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
