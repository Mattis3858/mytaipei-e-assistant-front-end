import { useState, useCallback, useEffect } from "react";
import {
  QA_SEARCH_ENDPOINT,
  HYBRID_RECOMMENDATION_ENDPOINT,
  BACKEND_API_BASE_URL,
  DEFAULT_USER_ID,
} from "../lib/constants";
import supabase from "../lib/supabaseClient";

const useSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [backendSearchResults, setBackendSearchResults] = useState(null);
  const [detailedSourcesInfo, setDetailedSourcesInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  const [recommendationsRaw, setRecommendationsRaw] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState(null);
  const [
    detailedRecommendationSourcesInfo,
    setDetailedRecommendationSourcesInfo,
  ] = useState(null);

  const fetchDetailedInfoFromSupabase = useCallback(
    async (sourceIds, setLoadingState, setDetailedInfoState) => {
      if (!supabase || sourceIds.length === 0) {
        setLoadingState(false);
        return [];
      }

      setLoadingState(true);
      try {
        const { data: info, error: supabaseError } = await supabase
          .from("info")
          .select("id, topic, content, url, department, image")
          .in("id", sourceIds);

        if (supabaseError) {
          console.error("Supabase fetch error:", supabaseError);
          return [];
        } else {
          setDetailedInfoState(info);
          return info;
        }
      } finally {
        setLoadingState(false);
      }
    },
    []
  );

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
          backendData.sources.length > 0
        ) {
          const sourceIds = backendData.sources.map((s) => s.id);
          await fetchDetailedInfoFromSupabase(
            sourceIds,
            setSupabaseLoading,
            setDetailedSourcesInfo
          );
        } else {
          setSupabaseLoading(false);
        }
      } catch (err) {
        console.error("Error fetching search data:", err);
        setError("搜尋失敗，請稍後再試。");
        setBackendSearchResults(null);
        setDetailedSourcesInfo(null);
      } finally {
        setLoading(false);
      }
    },
    [fetchDetailedInfoFromSupabase]
  );

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    setShowResults(false);
    setBackendSearchResults(null);
    setDetailedSourcesInfo(null);
    setError(null);
    setSupabaseLoading(false);
  }, []);

  const fetchRecommendations = useCallback(async () => {
    if (!BACKEND_API_BASE_URL) {
      setRecommendationError("後端 API 網址未配置。");
      setRecommendationLoading(false);
      return;
    }

    setRecommendationLoading(true);
    setRecommendationError(null);
    try {
      const userId = DEFAULT_USER_ID;
      const apiUrl = `${BACKEND_API_BASE_URL}${HYBRID_RECOMMENDATION_ENDPOINT}?user_id=${userId}&lambda_=3&alpha=0.5&top_k=10`;

      const response = await fetch(apiUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawRecommendationData = await response.json();
      console.log(rawRecommendationData);
      setRecommendationsRaw(rawRecommendationData);

      if (rawRecommendationData && rawRecommendationData.length > 0) {
        const sourceIds = rawRecommendationData.map((item) => item.id);
        await fetchDetailedInfoFromSupabase(
          sourceIds,
          setSupabaseLoading,
          setDetailedRecommendationSourcesInfo
        );
      } else {
        setSupabaseLoading(false);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setRecommendationError("載入個人化公告失敗，請稍後再試。");
      setRecommendationsRaw(null);
      setDetailedRecommendationSourcesInfo(null);
    } finally {
      setRecommendationLoading(false);
    }
  }, [fetchDetailedInfoFromSupabase]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

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
    recommendationsRaw,
    recommendationLoading,
    recommendationError,
    detailedRecommendationSourcesInfo,
  };
};

export default useSearch;
