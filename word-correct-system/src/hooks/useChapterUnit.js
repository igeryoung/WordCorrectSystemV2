// src/hooks/useChapterUnit.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiDomain } from '../config';

/**
 * chapter: the base chapter code
 */
export function useChapterUnit(chapter) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // determine API path: always scoped to chapter
    if (!chapter) {
      setUnits([]);
      return;
    }
    setLoading(true);
    setError(null);

    const url = `${apiDomain}/unit/${chapter}`;
    axios
      .get(url)
      .then(res => setUnits(res.data || []))
      .catch(err => setError(err.message || 'Fetch error'))
      .finally(() => setLoading(false));
  }, [chapter]);

  return { units, loading, error };
}
