"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import { createClient } from "@supabase/supabase-js";

const QA_SEARCH_ENDPOINT = "/qa/search";

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

if (!BACKEND_API_BASE_URL) {
  console.error("環境變數 NEXT_PUBLIC_BACKEND_API_BASE_URL 未設定！");
}
if (!supabase) {
  console.error(
    "環境變數 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY 未設定，Supabase 客戶端未初始化！"
  );
}

const Page = () => {
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [backendSearchResults, setBackendSearchResults] = useState(null);
  const [detailedSourcesInfo, setDetailedSourcesInfo] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  const searchHandler = async (query) => {
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
    setSelectedItem(null);

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
  };
  const handleSearch = () => searchHandler(searchText);

  const handleInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setShowResults(false);
    setBackendSearchResults(null);
    setDetailedSourcesInfo(null);
    setSelectedItem(null);
    setError(null);
    setSupabaseLoading(false);
  };

  const personalizedAnnouncements = [
    { id: 1, title: "公告標題一", content: "這是第一則個人化公告的詳細內容。" },
    { id: 2, title: "公告標題二", content: "這是第二則個人化公告的詳細內容。" },
    { id: 3, title: "公告標題三", content: "這是第三則個人化公告的詳細內容。" },
  ];

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleBackToList = () => {
    setSelectedItem(null);
  };

  const findDetailedInfo = (sourceId) => {
    if (!detailedSourcesInfo) return null;
    return detailedSourcesInfo.find((info) => info.id === sourceId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow p-4">
        {!selectedItem && (
          <div className="mt-2 mb-8 text-center ">
            <input
              type="text"
              placeholder="請輸入搜尋關鍵字..."
              value={searchText}
              onChange={handleInputChange}
              className=" w-5/12 p-2 mr-2 border-cyan-100 border-4 rounded text-teal-600 font-medium"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              className={`px-4 py-2 font-bold bg-cyan-100 text-black rounded hover:bg-cyan-200 cursor-pointer transition-colors duration-200 ${
                loading || supabaseLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={loading || supabaseLoading || !BACKEND_API_BASE_URL}
            >
              {loading ? "搜尋中..." : "搜尋"}
            </button>

            <div className="mt-4">
              <button
                onClick={() => searchHandler("生育補助")}
                className="px-4 py-2 mr-2 font-medium text-black rounded bg-cyan-100 hover:bg-gray-500 hover:text-white hover:border-white transition-colors duration-200 cursor-pointer"
              >
                生育補助
              </button>
              <button
                onClick={() => searchHandler("低收入戶托育津貼")}
                className="px-4 py-2 mr-2 font-medium text-black rounded bg-cyan-100 hover:bg-gray-500 hover:text-white hover:border-white transition-colors duration-200 cursor-pointer"
              >
                低收入戶托育津貼
              </button>
              <button
                onClick={() => searchHandler("生育獎勵金")}
                className="px-4 py-2 mr-2 font-medium text-black rounded bg-cyan-100 hover:bg-gray-500 hover:text-white hover:border-white transition-colors duration-200 cursor-pointer"
              >
                生育獎勵金
              </button>
            </div>
            {(!BACKEND_API_BASE_URL || !supabase) && (
              <p className="text-center text-red-600 mt-4">
                錯誤：後端 API 或 Supabase 網址/金鑰環境變數未設定！請檢查
                .env.local 檔案。
              </p>
            )}
          </div>
        )}

        <div className="pt-8 border-t border-gray-200">
          {selectedItem ? (
            <div className="detailed-view p-4 border border-gray-300 rounded bg-white shadow">
              <button
                onClick={handleBackToList}
                className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                返回
              </button>
              {console.log(selectedItem.topic)}
              {selectedItem.content ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    {selectedItem.topic}
                  </h2>
                  {selectedItem.image && (
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.topic}
                      className="w-80 h-auto mb-4 rounded"
                    />
                  )}
                  <p className="mb-2 whitespace-pre-wrap">
                    {selectedItem.content}
                  </p>
                  {selectedItem.department && (
                    <p className="text-sm text-gray-600 mb-2">
                      部門: {selectedItem.department}
                    </p>
                  )}
                  {selectedItem.url && (
                    <p className="text-sm text-gray-600">
                      網址:
                      <a
                        href={selectedItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedItem.url}
                      </a>
                    </p>
                  )}
                </>
              ) : selectedItem.url ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    {selectedItem.title}
                  </h2>
                  <p className="mb-2">部門: {selectedItem.department}</p>
                  <p className="mb-2">分數: {selectedItem.score.toFixed(4)}</p>
                  <p>
                    網址:
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedItem.url}
                    </a>
                  </p>
                  <p className="text-red-500 mt-2">
                    無詳細內容 (content) 可顯示。
                  </p>
                </>
              ) : (
                <p className="text-red-500">無法顯示詳細資訊，項目結構異常。</p>
              )}
            </div>
          ) : showResults ? (
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
                        const detailedInfo = findDetailedInfo(source.id);
                        const itemToDisplay = detailedInfo || source;

                        return (
                          <div
                            key={source.id}
                            className="p-4 border border-gray-300 rounded bg-white shadow cursor-pointer hover:bg-gray-100"
                            onClick={() => handleItemClick(itemToDisplay)}
                          >
                            <h3 className="text-lg font-semibold mb-2">
                              {itemToDisplay.topic}
                            </h3>
                            {itemToDisplay.image && (
                              <img
                                src={itemToDisplay.image}
                                alt={itemToDisplay.title}
                                className="w-80 h-auto mb-2 rounded"
                              />
                            )}
                            {itemToDisplay.content ? (
                              <p className="text-sm text-gray-700 mb-2">
                                {itemToDisplay.content.substring(0, 80)}...
                              </p>
                            ) : (
                              <>
                                <p className="text-sm text-gray-600">
                                  部門: {itemToDisplay.department}
                                </p>
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
                onClick={handleClearSearch}
                className="block mx-auto mt-8 px-6 py-3 bg-red-400 text-white rounded hover:bg-red-600 cursor-pointer transition-colors duration-200"
              >
                返回公告
              </button>
            </div>
          ) : (
            <div className="announcements">
              <h2 className="text-2xl font-bold text-center mb-4">
                個人化公告
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-40">
                {personalizedAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 border border-gray-300 rounded text-black shadow cursor-pointer bg-gray-300 hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => handleItemClick(announcement)}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {announcement.title}
                    </h3>
                    <p>{announcement.content.substring(0, 50)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;
