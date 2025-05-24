// // src/hooks/useChildItems.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiDomain } from '../config';

/**
 * chapter: the base chapter code
 * index: cascade level index (0-based)
 * parentCode: previous level selected code
 */
export function useChildItems(chapter, index, parentCode) {
  const [childItems, setChildItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // console.log("childItems", childItems)

  useEffect(() => {
    // determine API path: always scoped to chapter
    if (!chapter) {
      setChildItems([]);
      return;
    }
    setLoading(true);
    setError(null);

    const url = `${apiDomain}/chapters/${chapter}/links`;
    const params = {};
    // for index 0, no parentCode filter needed (parent_code optional)
    if (parentCode) params.parent_code = parentCode;

    axios
      .get(url, { params })
      .then(res => setChildItems(res.data || []))
      .catch(err => setError(err.message || 'Fetch error'))
      .finally(() => setLoading(false));
  }, [chapter, index, parentCode]);

  return { childItems, loading, error };
}
