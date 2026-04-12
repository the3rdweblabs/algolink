// src/hooks/useRecentSearches.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

const MAX_RECENT_SEARCHES = 7;
const LOCAL_STORAGE_KEY = 'algolink_recent_searches';

export function useRecentSearches(): {
  recentSearches: string[];
  addSearch: (query: string) => void;
  clearSearches: () => void;
} {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSearches = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedSearches) {
          setRecentSearches(JSON.parse(storedSearches));
        }
      } catch (error) {
        console.error("Error reading recent searches from localStorage:", error);
        setRecentSearches([]);
      }
    }
  }, []);

  const saveSearches = useCallback((searches: string[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(searches));
      } catch (error) {
        console.error("Error saving recent searches to localStorage:", error);
      }
    }
  }, []);

  const addSearch = useCallback(
    (query: string) => {
      if (!query || query.trim() === '') return;
      const normalizedQuery = query.trim();
      
      setRecentSearches((prevSearches) => {
        // Remove the query if it already exists to move it to the top
        const filteredSearches = prevSearches.filter((s) => s !== normalizedQuery);
        const newSearches = [normalizedQuery, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
        saveSearches(newSearches);
        return newSearches;
      });
    },
    [saveSearches]
  );

  const clearSearches = useCallback(() => {
    setRecentSearches([]);
    saveSearches([]);
  }, [saveSearches]);

  return { recentSearches, addSearch, clearSearches };
}
