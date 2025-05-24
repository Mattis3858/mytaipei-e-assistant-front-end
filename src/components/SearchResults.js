// components/SearchResults.js
import React from "react";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

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
            <p>{backendSearchResults.answer}</p>
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
                    {console.log(source.id)}
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
