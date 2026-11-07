/**
 * @file useInView.ts
 * Lightweight, high-performance IntersectionObserver hook for viewport entrance detection.
 * Avoids unthrottled scroll event handlers and eliminates layout thrashing.
 */

import { useState, useEffect, useRef, type RefObject } from 'react';
import type { UseInViewOptions } from './types';

interface UseInViewReturn<T extends HTMLElement> {
  readonly ref: RefObject<T | null>;
  readonly isInView: boolean;
}

/**
 * Checks whether IntersectionObserver is supported in the current environment.
 */
function isIntersectionObserverSupported(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

/**
 * Custom hook to detect when an element enters the viewport.
 * Uses native IntersectionObserver and unobserves upon entry for optimal memory and CPU usage.
 *
 * @param options - Configuration options for threshold, rootMargin, and single-trigger behavior.
 * @returns An object containing the element ref and visibility boolean.
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options: UseInViewOptions = {}
): UseInViewReturn<T> {
  const {
    threshold = 0.2,
    rootMargin = '0px 0px -10% 0px',
    triggerOnce = true,
    initialInView = false,
  } = options;

  // Initialize directly to true if IntersectionObserver is not supported (SSR or legacy browsers)
  const [isInView, setIsInView] = useState<boolean>(() => {
    if (initialInView) return true;
    if (typeof window !== 'undefined' && !isIntersectionObserverSupported()) {
      return true;
    }
    return false;
  });

  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    // If already in view and triggerOnce is enabled, no observer needed
    if (triggerOnce && isInView) return;

    if (!isIntersectionObserverSupported()) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, isInView]);

  return { ref: targetRef, isInView };
}

export default useInView;
