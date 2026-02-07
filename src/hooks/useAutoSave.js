import { useEffect, useRef, useState } from 'react';

export const useAutoSave = (callback, delay = 3000) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);

  const save = async (data) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSaving(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        await callback(data);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { save, saving, lastSaved };
};
