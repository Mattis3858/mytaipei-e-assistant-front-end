// components/DetailView.js
import React from "react";

const DetailView = ({ item, onBackToList }) => {
  return (
    <div className="detailed-view p-4 border border-gray-300 rounded bg-white shadow">
      <button
        onClick={onBackToList}
        className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 cursor-pointer transition-colors duration-200"
      >
        返回
      </button>
      {item.content ? (
        <>
          <h2 className="text-2xl font-bold mb-4">
            {item.topic || item.title}
          </h2>
          {item.image && (
            <img
              src={item.image}
              alt={item.topic || item.title}
              className="w-80 h-auto mb-4 rounded"
            />
          )}
          <p className="mb-2 whitespace-pre-wrap">{item.content}</p>
          {item.department && (
            <p className="text-sm text-gray-600 mb-2">
              部門: {item.department}
            </p>
          )}
          {item.url && (
            <p className="text-sm text-gray-600">
              網址:{" "}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {item.url}
              </a>
            </p>
          )}
        </>
      ) : item.url ? (
        <>
          <h2 className="text-2xl font-bold mb-4">
            {item.topic || item.title}
          </h2>
          <p className="mb-2">部門: {item.department}</p>
          {item.score !== undefined && (
            <p className="mb-2">分數: {item.score.toFixed(4)}</p>
          )}
          <p>
            網址:{" "}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {item.url}
            </a>
          </p>
          <p className="text-red-500 mt-2">無詳細內容 (content) 可顯示。</p>
        </>
      ) : (
        <p className="text-red-500">無法顯示詳細資訊，項目結構異常。</p>
      )}
    </div>
  );
};

export default DetailView;
