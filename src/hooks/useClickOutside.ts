import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook that handles click outside functionality
 * @param callback Function to call when clicking outside
 * @param enabled Whether the hook is enabled (default: true)
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled: boolean = true
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
};

/**
 * Custom hook for dropdown functionality with click outside
 * @param initialState Initial open state
 * @returns Object with isOpen state, setIsOpen function, and ref for the dropdown container
 */
export const useDropdown = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const ref = useClickOutside<HTMLDivElement>(closeDropdown, isOpen);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDropdownManual = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    setIsOpen,
    ref,
    toggleDropdown,
    openDropdown,
    closeDropdown: closeDropdownManual,
  };
};
