"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import AnnouncementList from "../components/AnnouncementList";
import DetailView from "../components/DetailView";
import useSearch from "../hooks/useSearch";
import {
  BACKEND_API_BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEFAULT_USER_ID,
} from "../lib/constants";

const Page = () => {
  const [selectedItem, setSelectedItem] = useState(null);

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
    recommendationsRaw,
    recommendationLoading,
    recommendationError,
    detailedRecommendationSourcesInfo,
  } = useSearch();

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleBackToList = () => {
    setSelectedItem(null);
  };

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
            <DetailView item={selectedItem} onBackToList={handleBackToList} />
          ) : showResults ? (
            <SearchResults
              loading={loading}
              supabaseLoading={supabaseLoading}
              error={error}
              backendSearchResults={backendSearchResults}
              detailedSourcesInfo={detailedSourcesInfo}
              onItemClick={handleItemClick}
              onClearSearch={handleClearSearch}
              currentUserId={DEFAULT_USER_ID}
            />
          ) : (
            <AnnouncementList
              recommendationsRaw={recommendationsRaw}
              loading={recommendationLoading}
              error={recommendationError}
              detailedSourcesInfo={detailedRecommendationSourcesInfo}
              onItemClick={handleItemClick}
              currentUserId={DEFAULT_USER_ID}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;
