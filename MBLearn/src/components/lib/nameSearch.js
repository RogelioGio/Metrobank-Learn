import { useState, useRef } from 'react';
import axiosClient from 'MBLearn/src/axios-client';

const nameSearch = (endpoint) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTokenRef = useRef(0);

  const search = async (searchTerm) => {
    const token = ++searchTokenRef.current;
    setLoading(true);

    try {
      const { data } = await axiosClient.get(endpoint, {
        params: { search: searchTerm },
      });

      if (token === searchTokenRef.current) {
        setResults(data);
      }
    } catch (error) {
      if (token === searchTokenRef.current) {
        console.error('Search error:', error);
      }
    } finally {
      if (token === searchTokenRef.current) {
        setLoading(false);
      }
    }
  };

  return { results, loading, search };
};

export default nameSearch;
