import axiosClient from 'MBLearn/src/axios-client';
import { useRef, useState } from 'react';

const globalSearch = (endpoint) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTokenRef = useRef(0);

  const search = async (params = {}) => {
    const token = ++searchTokenRef.current;
    setLoading(true);

    try {
      const { data } = await axiosClient.get(endpoint, { params });
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


export default globalSearch;
