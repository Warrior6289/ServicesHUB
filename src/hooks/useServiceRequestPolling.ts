import { useState, useEffect, useRef, useCallback } from 'react';
import { getNearbyInstantRequests } from '../api/serviceRequests';
import type { ServiceRequest } from '../types/serviceRequest';
import { getMockInstantRequests } from '../mocks/serviceRequests';

type UseServiceRequestPollingOptions = {
  enabled: boolean;
  intervalMs?: number;
  radius?: number;
  categoryId?: string;
  useMockData?: boolean;
};

export function useServiceRequestPolling({
  enabled,
  intervalMs = 20000, // 20 seconds default
  radius = 50,
  categoryId,
  useMockData = true, // Use mock data by default during development
}: UseServiceRequestPollingOptions) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  
  const previousRequestIdsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      let data: ServiceRequest[];
      
      if (useMockData) {
        // Use mock data during development
        data = getMockInstantRequests();
      } else {
        // Use real API
        data = await getNearbyInstantRequests(radius, categoryId);
      }

      // Check for new requests
      const currentIds = new Set(data.map(r => r.id));
      const previousIds = previousRequestIdsRef.current;
      
      const newIds = Array.from(currentIds).filter(id => !previousIds.has(id));
      
      if (newIds.length > 0 && previousIds.size > 0) {
        setNewRequestsCount(prev => prev + newIds.length);
        
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Service Request!', {
            body: `${newIds.length} new request(s) available`,
            icon: '/vite.svg',
          });
        }
        
        // Play sound (optional)
        // const audio = new Audio('/notification.mp3');
        // audio.play().catch(() => {});
      }

      previousRequestIdsRef.current = currentIds;
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [enabled, radius, categoryId, useMockData]);

  const refetch = useCallback(() => {
    fetchRequests();
  }, [fetchRequests]);

  const resetNewRequestsCount = useCallback(() => {
    setNewRequestsCount(0);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchRequests();
    }
  }, [enabled, fetchRequests]);

  // Set up polling interval
  useEffect(() => {
    if (enabled && intervalMs > 0) {
      intervalRef.current = setInterval(() => {
        fetchRequests();
      }, intervalMs);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enabled, intervalMs, fetchRequests]);

  // Refetch on window focus
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      fetchRequests();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, fetchRequests]);

  // Request notification permission
  useEffect(() => {
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [enabled]);

  return {
    requests,
    loading,
    error,
    refetch,
    newRequestsCount,
    resetNewRequestsCount,
  };
}

