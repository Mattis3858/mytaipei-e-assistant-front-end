// hooks/useSearch.js
import { useState, useCallback } from "react";
import { QA_SEARCH_ENDPOINT, BACKEND_API_BASE_URL } from "../lib/constants";
import supabase from "../lib/supabaseClient";

const useSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [backendSearchResults, setBackendSearchResults] = useState(null);
  const [detailedSourcesInfo, setDetailedSourcesInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  const searchHandler = useCallback(
    async (query) => {
      if (!query.trim()) return;
      if (!BACKEND_API_BASE_URL) {
        setError("後端 API 網址未配置。");
        return;
      }

      setSearchText(query);
      setLoading(true);
      setError(null);
      setShowResults(true);
      setBackendSearchResults(null);
      setDetailedSourcesInfo(null);

      const apiUrl = `${BACKEND_API_BASE_URL}${QA_SEARCH_ENDPOINT}`;

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, top_k: 6, min_score: 0 }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const backendData = await response.json();
        setBackendSearchResults(backendData);

        if (
          backendData &&
          backendData.sources &&
          backendData.sources.length > 0 &&
          supabase
        ) {
          const sourceIds = backendData.sources.map((s) => s.id);
          setSupabaseLoading(true);
          try {
            const { data: info, error: supabaseError } = await supabase
              .from("info")
              .select("id, topic, content, url, department, image")
              .in("id", sourceIds);

            if (supabaseError)
              console.error("Supabase fetch error:", supabaseError);
            else setDetailedSourcesInfo(info);
          } finally {
            setSupabaseLoading(false);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("搜尋失敗，請稍後再試。");
        setBackendSearchResults(null);
        setDetailedSourcesInfo(null);
      } finally {
        setLoading(false);
      }
    },
    [] // 依賴項為空，表示這個函數只在組件首次渲染時創建一次
  );

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    setShowResults(false);
    setBackendSearchResults(null);
    setDetailedSourcesInfo(null);
    setError(null);
    setSupabaseLoading(false);
  }, []);

  return {
    searchText,
    setSearchText,
    showResults,
    setShowResults,
    backendSearchResults,
    detailedSourcesInfo,
    loading,
    error,
    supabaseLoading,
    searchHandler,
    handleClearSearch,
  };
};

export default useSearch;
