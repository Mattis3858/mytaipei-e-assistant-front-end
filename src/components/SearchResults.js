import React, { useState, useEffect, useRef } from "react";
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
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);

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
      console.log(backendSearchResults);
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

  const handlePlayAudio = async () => {
    if (!summarizedAnswer) {
      setAudioError("沒有可播放的摘要。");
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    // Stop any currently playing audio
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
    }

    setIsPlayingAudio(true);
    setAudioError(null);
    const ttsApiUrl = `${BACKEND_API_BASE_URL}/tool/tts`;

    try {
      const response = await fetch(ttsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: summarizedAnswer,
          user_id: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(
        arrayBuffer
      );

      audioSourceRef.current = audioContextRef.current.createBufferSource();
      audioSourceRef.current.buffer = audioBuffer;
      audioSourceRef.current.connect(audioContextRef.current.destination);
      audioSourceRef.current.start(0);

      audioSourceRef.current.onended = () => {
        setIsPlayingAudio(false);
      };
    } catch (err) {
      console.error("Error playing audio:", err);
      setAudioError("無法播放語音，請稍後再試。");
      setIsPlayingAudio(false);
    }
  };
  const SpeakerIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-6 h-6 inline-block ml-2 cursor-pointer ${
        isPlayingAudio ? "text-blue-600" : "text-gray-600"
      }`}
      onClick={handlePlayAudio}
    >
      <path
        fillRule="evenodd"
        d="M9.375 9.75a.375.375 0 1 0 0-7.5.375.375 0 0 0 0 7.5ZM12 12.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .75.75Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M9.375 2.25a.375.375 0 1 0 0 7.5.375.375 0 0 0 0-7.5Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M21.05 12.25a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75Zm-3.15 4.35a.75.75 0 0 1-.75-.75V7.5a.75.75 0 0 1 1.5 0v8.4a.75.75 0 0 1-.75.75ZM15 15.75a.75.75 0 0 0 .75-.75V8.25a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 .75.75Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M9.375 2.25a.375.375 0 1 0 0 7.5.375.375 0 0 0 0-7.5Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M12 12.75a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .75.75ZM21.05 12.25a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75Zm-3.15 4.35a.75.75 0 0 1-.75-.75V7.5a.75.75 0 0 1 1.5 0v8.4a.75.75 0 0 1-.75.75ZM15 15.75a.75.75 0 0 0 .75-.75V8.25a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 .75.75ZM6 18.75a.75.75 0 0 0 .75-.75v-8.4a.75.75 0 0 0-1.5 0v8.4a.75.75 0 0 0 .75.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
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
            <h3 className="text-xl font-semibold mb-2">
              相關資訊摘要
              {summarizedAnswer && !summarizing && <SpeakerIcon />}
            </h3>
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
                    {itemToDisplay.url && (
                      <a
                        href={itemToDisplay.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        查看原文
                      </a>
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
