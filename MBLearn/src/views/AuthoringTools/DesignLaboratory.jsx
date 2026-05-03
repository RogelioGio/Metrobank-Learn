import React, { useState } from "react";
import {
  faTrashRestore,
  faFolder,
  faChalkboardTeacher,
  faFile,
  faVideo,
  faList,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TRASH_CATEGORIES = [
  { label: "Lessons", key: "Lesson", icon: faChalkboardTeacher },
  { label: "Assessments", key: "Assessment", icon: faList },
  { label: "Files", key: "FileAttachment", icon: faFile },
  { label: "Videos", key: "VideoAttachment", icon: faVideo },
];

const DesignLaboratory = ({ deletedItems = {}, onRestore }) => {
  const [activeTab, setActiveTab] = useState("Lesson");

  const handleRestore = (itemId) => {
    if (onRestore) onRestore(activeTab, itemId);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-x-2 text-primary text-2xl">
            <FontAwesomeIcon icon={faFolder} />
            <p className="font-header text-primary">Trash Bin</p>
          </div>
          <p className="text-xs font-text">
            Restore deleted course items organized by type.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-row gap-2 border-b border-divider pb-2">
        {TRASH_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === cat.key
                ? "bg-primary text-white shadow"
                : "bg-white text-primary hover:bg-primaryhover hover:text-white border border-primary"
            }`}
          >
            <FontAwesomeIcon icon={cat.icon} className="mr-2" />
            {cat.label} ({(deletedItems[cat.key] || []).length})
          </button>
        ))}
      </div>

      {/* Trash Items */}
      <div className="border border-divider rounded-md bg-white shadow-md flex-1 overflow-y-auto p-4">
        {(deletedItems[activeTab] || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-unactive text-center gap-2">
            <div className="bg-primarybg w-20 h-20 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faXmark} className="text-3xl text-primary" />
            </div>
            <p className="font-text text-sm">
              No deleted {activeTab.toLowerCase()}s found.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {deletedItems[activeTab].map((item) => (
              <div
                key={item.id}
                className="flex flex-row justify-between items-center border border-primary rounded-md p-4 bg-white shadow-sm"
              >
                <div className="flex flex-col">
                  <p className="font-header text-primary">{item.title}</p>
                  <p className="text-xs text-unactive font-text">
                    Deleted on {new Date(item.deletedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="w-10 h-10 text-lg bg-primary border-2 text-white border-primary rounded-md shadow-md flex items-center justify-center transition-all ease-in-out hover:bg-primaryhover hover:border-primaryhover"
                  onClick={() => handleRestore(item.id)}
                >
                  <FontAwesomeIcon icon={faTrashRestore} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignLaboratory;
