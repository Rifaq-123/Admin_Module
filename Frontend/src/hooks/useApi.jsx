// hooks/useApi.js
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for API calls with loading, error, and caching
 */
export const useApi = (apiFunc, options = {}) => {
  const { 
    immediate = true,
    cache = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  const cacheRef = useRef({ data: null, timestamp: 0 });
  const mountedRef = useRef(true);

  const execute = useCallback(async (...args) => {
    // Check cache first
    if (cache && cacheRef.current.data) {
      const age = Date.now() - cacheRef.current.timestamp;
      if (age < cacheTime) {
        setData(cacheRef.current.data);
        setLoading(false);
        return cacheRef.current.data;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunc(...args);
      
      if (!mountedRef.current) return;
      
      setData(result);
      
      // Update cache
      if (cache) {
        cacheRef.current = { data: result, timestamp: Date.now() };
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      if (!mountedRef.current) return;
      
      const message = err.message || "An error occurred";
      setError(message);
      onError?.(err);
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunc, cache, cacheTime, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    
    if (immediate) {
      execute();
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Force refetch (ignores cache)
  const refetch = useCallback((...args) => {
    cacheRef.current = { data: null, timestamp: 0 };
    return execute(...args);
  }, [execute]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current = { data: null, timestamp: 0 };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    execute, 
    refetch,
    clearCache,
    setData 
  };
};

/**
 * Hook for paginated API calls
 */
export const usePaginatedApi = (apiFunc, initialPage = 0, pageSize = 20) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const mountedRef = useRef(true);

  const fetchPage = useCallback(async (pageNum, reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunc(pageNum, pageSize);
      
      if (!mountedRef.current) return;
      
      const content = result.content || [];
      
      if (reset) {
        setData(content);
      } else {
        setData(prev => [...prev, ...content]);
      }
      
      setTotalPages(result.totalPages || 0);
      setTotalItems(result.totalItems || result.totalElements || 0);
      setPage(pageNum);
      
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load data");
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunc, pageSize]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    fetchPage(0, true);

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(() => {
    return fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loading && page < totalPages - 1) {
      return fetchPage(page + 1, false);
    }
  }, [loading, page, totalPages, fetchPage]);

  const goToPage = useCallback((pageNum) => {
    return fetchPage(pageNum, true);
  }, [fetchPage]);

  const hasMore = page < totalPages - 1;

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    hasMore,
    loadMore,
    refresh,
    goToPage,
    setData
  };
};

export default useApi;