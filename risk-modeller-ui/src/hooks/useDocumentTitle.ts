import { useEffect } from 'react';

/**
 * Sets `document.title` while the component is mounted and restores the previous
 * title on unmount. Not tied to any single feature, so it lives in `hooks/`.
 */
export const useDocumentTitle = (title: string): void => {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
};
