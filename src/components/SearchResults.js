import React, { useState, useEffect } from "react";
import Image from "next/image";
import supabase from "../lib/supabaseClient";
import { BACKEND_API_BASE_URL } from "../lib/constants";

const SearchResults = ({
  loading,
  supabaseLoading,
  error,
  backendSearchResults,
  detailedSourcesInfo,
  onItemClick,
  onClearSearch,
  currentUserId,
}) => {
  const [summarizedAnswer, setSummarizedAnswer] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState(null);
  const findDetailedInfo = (sourceId) => {
    if (!detailedSourcesInfo) return null;
    return detailedSourcesInfo.find((info) => info.id === sourceId);
  };
  const handleItemClickAndLog = async (item) => {
    onItemClick(item);
    if (supabase && currentUserId && item.id) {
      try {
        const { data, error } = await supabase.from("browse").insert([
          {
            user_id: currentUserId,
            info_id: item.id,
          },
        ]);
        if (error) {
          console.error("Error inserting browse record:", error);
        } else {
          console.log("Browse record inserted successfully:", data);
        }
      } catch (e) {
        console.error("Supabase insert failed:", e);
      }
    } else {
      console.warn(
        "Supabase client or user ID or item ID is missing. Cannot log browse."
      );
    }
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (
        backendSearchResults &&
        backendSearchResults.answer &&
        BACKEND_API_BASE_URL
      ) {
        setSummarizing(true);
        setSummarizeError(null);
        setSummarizedAnswer(null);
        const summarizeApiUrl = `${BACKEND_API_BASE_URL}/tool/summarize`;

        try {
          const response = await fetch(summarizeApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: backendSearchResults.answer,
              user_id: currentUserId,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body.getReader();
          let receivedText = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            receivedText += new TextDecoder().decode(value);
          }
          setSummarizedAnswer(receivedText);
        } catch (err) {
          console.error("Error fetching summary:", err);
          setSummarizeError("無法生成摘要，請稍後再試。");
        } finally {
          setSummarizing(false);
        }
      }
    };

    fetchSummary();
  }, [backendSearchResults, currentUserId]);

  return (
    <div className="searchResults">
      <h2 className="text-2xl font-bold text-center mb-6">搜尋結果</h2>
      {loading || supabaseLoading ? (
        <p className="text-center">載入中...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : backendSearchResults &&
        backendSearchResults.answer &&
        backendSearchResults.sources ? (
        <>
          <div className="mb-6 p-4 border border-dashed border-blue-500 bg-blue-50 rounded whitespace-pre-wrap">
            <h3 className="text-xl font-semibold mb-2">相關資訊</h3>
            {console.log(summarizedAnswer)}
            {summarizing ? (
              <p>正在生成摘要...</p>
            ) : summarizeError ? (
              <p className="text-red-600">{summarizeError}</p>
            ) : summarizedAnswer ? (
              <p>{summarizedAnswer}</p>
            ) : (
              <p>{backendSearchResults.answer}</p>
            )}
          </div>
          {backendSearchResults.sources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {backendSearchResults.sources.map((source) => {
                const itemToDisplay = findDetailedInfo(source.id) || source;

                return (
                  <div
                    key={source.id}
                    className="p-4 border border-gray-300 rounded bg-white shadow cursor-pointer hover:bg-gray-100"
                    onClick={() => handleItemClickAndLog(itemToDisplay)}
                  >
                    {/* {console.log(source.id)} */}
                    <h3 className="text-lg font-semibold mb-2">
                      {itemToDisplay.topic || itemToDisplay.title}
                    </h3>
                    {itemToDisplay.image && (
                      <Image
                        src={itemToDisplay.image}
                        alt={itemToDisplay.topic || itemToDisplay.title}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover mb-2 rounded"
                      />
                    )}
                    {itemToDisplay.content ? (
                      <p className="text-sm text-gray-700 mb-2">
                        {itemToDisplay.content.substring(0, 80)}...
                      </p>
                    ) : (
                      <>
                        {itemToDisplay.department && (
                          <p className="text-sm text-gray-600">
                            部門: {itemToDisplay.department}
                          </p>
                        )}
                        {itemToDisplay.score !== undefined && (
                          <p className="text-sm text-gray-600">
                            分數: {itemToDisplay.score.toFixed(4)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center">沒有找到相關來源資料。</p>
          )}
        </>
      ) : (
        <p className="text-center">搜尋結果結構異常或為空。</p>
      )}
      <button
        onClick={onClearSearch}
        className="block mx-auto mt-8 px-6 py-3 bg-red-400 text-white rounded hover:bg-red-600 cursor-pointer transition-colors duration-200"
      >
        返回公告
      </button>
    </div>
  );
};

export default SearchResults;
