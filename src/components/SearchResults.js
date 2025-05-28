import React, { useState, useRef } from "react";
import Image from "next/image";
import supabase from "../lib/supabaseClient";
import { BACKEND_API_BASE_URL, DEFAULT_USER_ID } from "../lib/constants";

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
  const [audioCtx, setAudioCtx] = useState(null);
  const audioSourceRef = useRef(null);
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

  const handleSpeakAnswer = async () => {
    if (!backendSearchResults || !backendSearchResults.answer) {
      console.warn("No answer available to speak.");
      return;
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    if (!audioCtx) {
      setAudioCtx(new (window.AudioContext || window.webkitAudioContext)());
    }

    try {
      const payload = {
        text: backendSearchResults.answer,
        user_id: DEFAULT_USER_ID,
      };

      const ttsApiUrl = `${BACKEND_API_BASE_URL}/tool/tts`;
      console.log(ttsApiUrl);
      const response = await fetch(ttsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(arrayBuffer);
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      console.log(audioBuffer);

      const source = audioCtx.createBufferSource();
      console.log(source);
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start(0);
      audioSourceRef.current = source; // Store the source to stop it later
    } catch (e) {
      console.error("Audio playback failed:", e);
      alert("語音播放失敗。請稍後再試。");
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
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              相關資訊
              <button
                onClick={handleSpeakAnswer}
                className="ml-2 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="播放相關資訊"
              >
                {/* Speaker icon (from Heroicons for easy use) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-gray-700"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.363 2.5a.75.75 0 0 0-1.06 0L4.31 6.554A6.813 6.813 0 0 0 3 12c0 2.56.943 4.867 2.453 6.621.4.405.748.867 1.042 1.372a.75.75 0 1 0 1.348-.832 11.23 11.23 0 0 1-1.291-1.954A7.813 7.813 0 0 1 4.5 12c0-2.072.684-3.954 1.848-5.467l3.015-3.016ZM12 4.5c.67 0 1.32.128 1.938.375a.75.75 0 0 0 .612-1.45A10.5 10.5 0 0 0 12 3C7.03 3 3 7.03 3 12a9 9 0 0 0 .285 2.158.75.75 0 0 0 1.258.118A7.5 7.5 0 0 1 4.5 12c0-3.309 2.691-6 6-6h1.5V4.5Zm4.863 1.57a.75.75 0 0 0-1.226-.723A11.037 11.037 0 0 1 18 12c0 1.282-.284 2.511-.822 3.63.308.06.61.14.904.241a.75.75 0 0 0 .584-1.395 9.53 9.53 0 0 0-.666-1.571.75.75 0 0 0-.213-.357c-.156-.145-.331-.274-.523-.388a.75.75 0 0 0-.742 1.298c.17.098.322.203.46.314ZM12 7.5a4.5 4.5 0 0 0-4.5 4.5h1.5a3 3 0 0 1 3-3V7.5ZM21 12c0-2.385-1.22-4.509-3.045-5.714a.75.75 0 0 0-.847 1.281 9 9 0 0 1 2.292 4.433.75.75 0 0 0 1.6-.2C21.056 12.355 21 12.179 21 12Zm-.555 6.472a.75.75 0 0 0-.256-1.385 6.813 6.813 0 0 1-2.453-6.621 7.813 7.813 0 0 1 1.291 1.954.75.75 0 0 0 1.348-.832 11.23 11.23 0 0 0-1.042-1.372 6.813 6.813 0 0 0 1.554 8.256.75.75 0 0 0 .558.106Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </h3>
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
                    {/* console.log(source.id) should not be directly in JSX */}
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
