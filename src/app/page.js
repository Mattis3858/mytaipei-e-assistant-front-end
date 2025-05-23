// app/page.js
"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/Searchbar";
import SearchResults from "../components/SearchResults";
import AnnouncementList from "../components/AnnouncementList";
import DetailView from "../components/DetailView";
import useSearch from "../hooks/useSearch";
import {
  BACKEND_API_BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "../lib/constants"; // 引入常數

const Page = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  // 使用 custom hook 處理搜尋邏輯
  const {
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
  } = useSearch();

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleBackToList = () => {
    setSelectedItem(null);
  };

  // 個人化公告資料，可以考慮移到一個常數檔案或從後端獲取
  const personalizedAnnouncements = [
    { id: 1, topic: "公告標題一", content: "這是第一則個人化公告的詳細內容。" },
    { id: 2, topic: "公告標題二", content: "這是第二則個人化公告的詳細內容。" },
    { id: 3, topic: "公告標題三", content: "這是第三則個人化公告的詳細內容。" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onLogoClick={handleClearSearch} />

      <main className="flex-grow p-4">
        {!selectedItem && (
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            handleSearch={() => searchHandler(searchText)}
            handleQuickSearch={searchHandler}
            loading={loading || supabaseLoading}
            backendApiConfigured={!!BACKEND_API_BASE_URL}
            supabaseConfigured={!!(SUPABASE_URL && SUPABASE_ANON_KEY)}
          />
        )}

        <div className="pt-8 border-t border-gray-200">
          {selectedItem ? (
            <DetailView
              item={selectedItem}
              onBackToList={handleBackToList}
              findDetailedInfo={
                showResults
                  ? (id) => detailedSourcesInfo?.find((info) => info.id === id)
                  : null
              } // 只有在顯示搜尋結果時才傳遞 findDetailedInfo
            />
          ) : showResults ? (
            <SearchResults
              loading={loading}
              supabaseLoading={supabaseLoading}
              error={error}
              backendSearchResults={backendSearchResults}
              detailedSourcesInfo={detailedSourcesInfo}
              onItemClick={handleItemClick}
              onClearSearch={handleClearSearch}
            />
          ) : (
            <AnnouncementList
              announcements={personalizedAnnouncements}
              onItemClick={handleItemClick}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;
