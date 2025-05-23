// components/SearchBar.js
import React from "react";

const SearchBar = ({
  searchText,
  setSearchText,
  handleSearch,
  handleQuickSearch,
  loading,
  backendApiConfigured,
  supabaseConfigured,
}) => {
  const handleInputChange = (event) => {
    setSearchText(event.target.value);
  };

  return (
    <div className="mt-2 mb-8 text-center">
      <input
        type="text"
        placeholder="請輸入搜尋關鍵字..."
        value={searchText}
        onChange={handleInputChange}
        className="w-5/12 p-2 mr-2 border-cyan-100 border-4 rounded text-teal-600 font-medium"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <button
        onClick={handleSearch}
        className={`px-4 py-2 font-bold bg-cyan-100 text-black rounded hover:bg-cyan-200 cursor-pointer transition-colors duration-200 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading || !backendApiConfigured || !supabaseConfigured}
      >
        {loading ? "搜尋中..." : "搜尋"}
      </button>

      <div className="mt-4">
        <button
          onClick={() => handleQuickSearch("生育補助")}
          className="px-4 py-2 mr-2 font-medium text-black rounded bg-cyan-100 hover:bg-gray-500 hover:text-white hover:border-white transition-colors duration-200 cursor-pointer"
        >
          生育補助
        </button>
        <button
          onClick={() => handleQuickSearch("低收入戶托育津貼")}
          className="px-4 py-2 mr-2 font-medium text-black rounded bg-cyan-100 hover:bg-gray-500 hover:text-white hover:border-white transition-colors duration-200 cursor-pointer"
        >
          低收入戶托育津貼
        </button>
        <button
          onClick={() => handleQuickSearch("生育獎勵金")}
          className="px-4 py-2 mr-2 font-medium text-black rounded bg-cyan-100 hover:bg-gray-500 hover:text-white hover:border-white transition-colors duration-200 cursor-pointer"
        >
          生育獎勵金
        </button>
      </div>
      {(!backendApiConfigured || !supabaseConfigured) && (
        <p className="text-center text-red-600 mt-4">
          錯誤：後端 API 或 Supabase 網址/金鑰環境變數未設定！請檢查 .env.local
          檔案。
        </p>
      )}
    </div>
  );
};

export default SearchBar;
