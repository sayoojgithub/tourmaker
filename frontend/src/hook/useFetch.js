import { useState, useEffect } from "react";

const useFetch = (url, options = {}) => {
  const { method = "GET", headers = {}, body = null } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, {
          method,
          headers,
          body: method !== "GET" && body ? JSON.stringify(body) : null,
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, method, headers, body]);

  return { data, loading, error };
};

export default useFetch;