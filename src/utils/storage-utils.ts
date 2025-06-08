/**
 * Utility functions for safely interacting with localStorage
 * Provides fallbacks and error handling for mobile environments
 */

/**
 * Safely get an item from localStorage with proper error handling
 * 
 * @param key The storage key to retrieve
 * @param defaultValue Default value to return if not found or error
 * @returns The parsed value from storage or default value
 */
export function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    try {
      return JSON.parse(item) as T;
    } catch (parseError) {
      console.error(`Error parsing "${key}" from localStorage:`, parseError);
      return defaultValue;
    }
  } catch (storageError) {
    // Handle case where localStorage is not available (e.g. private browsing)
    console.error(`Cannot access localStorage for "${key}":`, storageError);
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage with proper error handling
 * 
 * @param key The storage key to set
 * @param value The value to store (will be JSON stringified)
 * @returns True if successful, false if failed
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error storing "${key}" in localStorage:`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage with proper error handling
 * 
 * @param key The storage key to remove
 * @returns True if successful, false if failed
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing "${key}" from localStorage:`, error);
    return false;
  }
}

/**
 * Check if localStorage is available
 * 
 * @returns True if localStorage is available, false otherwise
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '___test___';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}
