import { useEffect, useState } from 'react';

/**
 * Custom hook to debounce any fast-changing value (e.g. search input)
 * @param value The value to debounce
 * @param delayMs Delay in milliseconds (default 400ms)
 */
export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

