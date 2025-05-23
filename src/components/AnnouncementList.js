// components/AnnouncementList.js
import React from "react";

const AnnouncementList = ({ announcements, onItemClick }) => {
  return (
    <div className="announcements">
      <h2 className="text-2xl font-bold text-center mb-4">個人化公告</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-40">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="p-4 border border-gray-300 rounded text-black shadow cursor-pointer bg-gray-300 hover:bg-gray-200 transition-colors duration-200"
            onClick={() => onItemClick(announcement)}
          >
            <h3 className="text-lg font-semibold mb-2">
              {announcement.topic || announcement.title}
            </h3>
            <p>{announcement.content.substring(0, 50)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementList;
