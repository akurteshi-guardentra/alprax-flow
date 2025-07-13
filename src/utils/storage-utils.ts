/**
 * Enhanced storage utilities for production
 */

export class SecureStorage {
  private static readonly PREFIX = 'alprax_';

  static setItem(key: string, value: any): void {
    try {
      const prefixedKey = this.PREFIX + key;
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now()
      });
      localStorage.setItem(prefixedKey, serializedValue);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const prefixedKey = this.PREFIX + key;
      const item = localStorage.getItem(prefixedKey);
      if (!item) return null;

      const { data } = JSON.parse(item);
      return data;
    } catch (error) {
      console.error('Storage retrieval error:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    const prefixedKey = this.PREFIX + key;
    localStorage.removeItem(prefixedKey);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  static getStorageInfo(): { used: number; available: number } {
    let used = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Storage calculation error:', error);
    }

    return {
      used,
      available: 5 * 1024 * 1024 - used // Assume 5MB limit
    };
  }
}

/**
 * Safe storage utilities (existing)
 */
export const safeSetItem = (key: string, value: any): boolean => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage item ${key}:`, error);
    return false;
  }
};

export const safeGetItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Failed to get localStorage item ${key}:`, error);
    return defaultValue;
  }
};