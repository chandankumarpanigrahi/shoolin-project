'use client';

import { useState, useEffect, useCallback } from 'react';

// Custom event to notify all useUrlParam/useUrlTab hooks in the same window
const URL_CHANGE_EVENT = 'shoolin_url_change';

/**
 * Read query parameter from current window URL
 */
export function getUrlParam(key) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

/**
 * Set single query parameter without reloading page or causing Next.js flicker
 */
export function setUrlParam(key, value, replace = false) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (value === null || value === undefined || value === '') {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  const newRelativePathQuery = url.pathname + url.search + url.hash;
  if (replace) {
    window.history.replaceState(window.history.state, '', newRelativePathQuery);
  } else {
    window.history.pushState(window.history.state, '', newRelativePathQuery);
  }
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

/**
 * Remove single query parameter from current window URL
 */
export function removeUrlParam(key, replace = false) {
  setUrlParam(key, null, replace);
}

/**
 * Set or delete multiple query parameters atomically
 */
export function setMultipleUrlParams(paramsObj, replace = false) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  const newRelativePathQuery = url.pathname + url.search + url.hash;
  if (replace) {
    window.history.replaceState(window.history.state, '', newRelativePathQuery);
  } else {
    window.history.pushState(window.history.state, '', newRelativePathQuery);
  }
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

/**
 * Hook to synchronize a state value with a URL query parameter.
 * Automatically reflects defaultValue in the URL on mount if parameter is not present.
 * Provides instant reactivity across browser history, popstate, and page refreshes.
 */
export function useUrlParam(key, defaultValue = '', syncDefaultToUrl = true) {
  const [val, setVal] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    const initial = getUrlParam(key);
    return (initial !== null && initial !== '') ? initial : defaultValue;
  });

  useEffect(() => {
    // If the query parameter is not present in URL on mount, write defaultValue into URL
    if (typeof window !== 'undefined' && syncDefaultToUrl && defaultValue) {
      const existing = getUrlParam(key);
      if (existing === null || existing === '') {
        setUrlParam(key, defaultValue, true); // replace: true preserves back history
      }
    }

    const handleUrlChange = () => {
      const current = getUrlParam(key);
      if (current !== null && current !== '') {
        setVal(current);
      } else {
        setVal(defaultValue);
        if (syncDefaultToUrl && defaultValue) {
          setUrlParam(key, defaultValue, true);
        }
      }
    };

    window.addEventListener(URL_CHANGE_EVENT, handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener(URL_CHANGE_EVENT, handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [key, defaultValue, syncDefaultToUrl]);

  const updateVal = useCallback(
    (newVal, replace = false) => {
      setVal(newVal);
      setUrlParam(key, newVal, replace);
    },
    [key]
  );

  return [val || defaultValue, updateVal];
}

/**
 * Hook specialized for tab navigation (defaults to query param '?tab=...')
 * Automatically updates URL with default tab on initial page load if missing or invalid.
 * Ensures the returned tab is always valid against allowedTabs (falling back to defaultTab).
 */
export function useUrlTab(paramKey = 'tab', defaultTab = '', allowedTabsOrSync = [], maybeSync = true) {
  const allowedTabs = Array.isArray(allowedTabsOrSync) ? allowedTabsOrSync : [];
  const syncDefaultToUrl = typeof allowedTabsOrSync === 'boolean' ? allowedTabsOrSync : maybeSync;

  const [rawVal, setRawVal] = useUrlParam(paramKey, defaultTab, syncDefaultToUrl);

  const cleanVal = (rawVal || '').toLowerCase().trim();
  const isValid = allowedTabs.length === 0 || allowedTabs.includes(cleanVal);
  const activeTab = isValid ? (cleanVal || defaultTab) : defaultTab;

  useEffect(() => {
    if (typeof window !== 'undefined' && allowedTabs.length > 0) {
      const current = getUrlParam(paramKey);
      if (current && !allowedTabs.includes(current.toLowerCase().trim())) {
        setUrlParam(paramKey, defaultTab, true);
      }
    }
  }, [paramKey, defaultTab, allowedTabs]);

  const setActiveTab = useCallback(
    (newTab, replace = false) => {
      setRawVal(newTab, replace);
    },
    [setRawVal]
  );

  return [activeTab, setActiveTab];
}

