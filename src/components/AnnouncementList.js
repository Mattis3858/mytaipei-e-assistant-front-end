import React from "react";
import Image from "next/image";
import supabase from "../lib/supabaseClient";

const AnnouncementList = ({
  recommendationsRaw,
  loading,
  error,
  detailedSourcesInfo,
  onItemClick,
  currentUserId,
}) => {
  const combinedRecommendations = React.useMemo(() => {
    if (!recommendationsRaw || !detailedSourcesInfo) return [];

    return recommendationsRaw
      .map((recItem) => {
        const detailed = detailedSourcesInfo.find(
          (info) => info.id === recItem.id
        );
        return {
          ...recItem,
          ...(detailed || {}),
          topic: detailed?.topic || detailed?.title || `ID: ${recItem.id}`,
          score: recItem.hybrid_score,
        };
      })
      .filter((item) => item.topic);
  }, [recommendationsRaw, detailedSourcesInfo]);

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
    <div className="announcements">
      <h2 className="text-2xl font-bold text-center mb-4">個人化公告</h2>
      {loading ? (
        <p className="text-center">載入個人化公告中...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : combinedRecommendations && combinedRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combinedRecommendations.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-gray-300 rounded text-black shadow cursor-pointer bg-gray-300 hover:bg-gray-200 transition-colors duration-200"
              onClick={() => handleItemClickAndLog(item)}
            >
              <h3 className="text-lg font-semibold mb-2">{item.topic}</h3>
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.topic}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover mb-2 rounded"
                />
              )}
              {item.content ? (
                <p className="text-sm text-gray-700 mb-2">
                  {item.content.substring(0, 100)}...
                </p>
              ) : (
                <p className="text-sm text-gray-600 mb-2">
                  {item.department && `部門: ${item.department}`}
                  {item.department && item.score !== undefined && " | "}
                  {item.score !== undefined && `分數: ${item.score.toFixed(4)}`}
                </p>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  查看原文
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">沒有找到個人化公告。</p>
      )}
    </div>
  );
};

export default AnnouncementList;
