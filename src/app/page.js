// src/app/page.js
"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";

// 定義 API 的相對路徑
const QA_SEARCH_ENDPOINT = "/qa/search";

const Page = () => {
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 從環境變數獲取後端基礎網址
  const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL;

  // 確保基礎網址已設定
  if (!BACKEND_API_BASE_URL) {
    console.error("環境變數 NEXT_PUBLIC_BACKEND_API_BASE_URL 未設定！");
    // 在實際應用中，您可能需要更友善的錯誤處理
  }

  const handleSearch = async () => {
    console.log(searchText);
    if (!searchText.trim()) {
      return;
    }

    // 檢查基礎網址是否存在
    if (!BACKEND_API_BASE_URL) {
      setError("後端 API 網址未配置。");
      return;
    }

    setLoading(true);
    setError(null);
    setShowResults(true);
    setSearchResults(null);
    setSelectedItem(null);

    // 構建完整的 API 網址
    const apiUrl = `${BACKEND_API_BASE_URL}${QA_SEARCH_ENDPOINT}`;

    try {
      const response = await fetch(apiUrl, {
        // 使用構建好的 apiUrl
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchText,
          top_k: 4,
          min_score: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("搜尋失敗，請稍後再試。");
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setShowResults(false);
    setSearchResults(null);
    setSelectedItem(null);
    setError(null);
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow p-4">
        <h2 className="text-2xl font-bold text-center mb-2">搜尋</h2>
        {!selectedItem && (
          <div className="mb-8 text-center">
            <input
              type="text"
              placeholder="請輸入搜尋關鍵字..."
              value={searchText}
              onChange={handleInputChange}
              className="p-2 mr-2 border border-gray-300 rounded"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading || !BACKEND_API_BASE_URL} // 如果網址未設定，也禁用按鈕
            >
              {loading ? "搜尋中..." : "搜尋"}
            </button>

            <div className="mt-4">
              <button className="px-4 py-2 mr-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50">
                測試
              </button>
              <button className="px-4 py-2 mr-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50">
                測試
              </button>
              <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50">
                測試
              </button>
            </div>
            {/* 顯示 API 網址未設定的錯誤 */}
            {!BACKEND_API_BASE_URL && (
              <p className="text-center text-red-600 mt-4">
                錯誤：後端 API 網址環境變數 NEXT_PUBLIC_BACKEND_API_BASE_URL
                未設定！請在 .env.local 中設定。
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
              {selectedItem.url ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    {selectedItem.title}
                  </h2>
                  <p className="mb-2">部門: {selectedItem.department}</p>
                  <p className="mb-2">分數: {selectedItem.score.toFixed(4)}</p>
                  <p>
                    網址:{" "}
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedItem.url}
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    {selectedItem.title}
                  </h2>
                  <p>{selectedItem.content}</p>
                </>
              )}
            </div>
          ) : showResults ? (
            <div className="searchResults">
              <h2 className="text-2xl font-bold text-center mb-6">搜尋結果</h2>
              {loading ? (
                <p className="text-center">載入中...</p>
              ) : error ? (
                <p className="text-center text-red-600">{error}</p>
              ) : searchResults &&
                searchResults.answer &&
                searchResults.sources ? ( // 檢查 searchResults 及其內部結構
                <>
                  <div className="mb-6 p-4 border border-dashed border-blue-500 bg-blue-50 rounded whitespace-pre-wrap">
                    <h3 className="text-xl font-semibold mb-2">相關資訊</h3>
                    <p>{searchResults.answer}</p>
                  </div>
                  {searchResults.sources.length > 0 ? ( // 檢查 sources 陣列是否為空
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.sources.map((source) => (
                        <div
                          key={source.id}
                          className="p-4 border border-gray-300 rounded bg-white shadow cursor-pointer hover:bg-gray-100"
                          onClick={() => handleItemClick(source)}
                        >
                          <h3 className="text-lg font-semibold mb-2">
                            {source.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            部門: {source.department}
                          </p>
                          <p className="text-sm text-gray-600">
                            分數: {source.score.toFixed(4)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center">沒有找到相關來源資料。</p> // sources 陣列為空時顯示
                  )}
                </>
              ) : (
                // API 成功回傳但沒有 answer 或 sources 欄位 (不應發生，但作為防護)
                <p className="text-center">搜尋結果結構異常。</p>
              )}
              <button
                onClick={handleClearSearch}
                className="block mx-auto mt-8 px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
              >
                返回公告
              </button>
            </div>
          ) : (
            <div className="announcements">
              <h2 className="text-2xl font-bold text-center mb-6">
                個人化公告
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalizedAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 border border-gray-300 rounded bg-white shadow cursor-pointer hover:bg-gray-100"
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
