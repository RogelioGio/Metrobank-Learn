import React, { useState, useRef, useEffect } from "react";
import axiosClient from "MBLearn/src/axios-client";
import NotificationMessageModal from "./NotificationMessageModal";

const NotificationBellPopup = ({ onClose, notifications, setNotifications, unreadCount, setUnreadCount, loading }) => {
  const dropdownRef = useRef(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen) return;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, isModalOpen]);

  useEffect(() => {
    axiosClient
      .get("/notifications")
      .then(({ data }) => {
        setNotifications(data);
      })
      .catch((err) => {
        console.error("Failed to fetch notifications:", err);
      })
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.ReadAt).length;
    setUnreadCount(unread);
  }, [notifications]);

  console.log("nawawalang notif: ", notifications);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    });
  };

  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    setIsModalOpen(true);

    if (!notif.ReadAt) {
      try {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, ReadAt: new Date().toISOString() } : n
          )
        );
        await axiosClient.post(`/notifications/${notif.id}/read`);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute top-full right-0 mt-2 w-[85vw] md:w-96 bg-white rounded-md shadow-lg border border-divider z-50"
      >
        <div className="p-4 border-b border-divider">
          <h2 className="text-primary text-base md:text-lg font-header">
            Notifications
          </h2>
          <p className="text-unactive text-xs md:text-sm font-text">
            {notifications.length > 0
              ? `You have ${
                  notifications.filter((n) => !n.ReadAt).length
                } unread notification${
                  notifications.length !== 1 ? "s" : ""
                }`
              : "No notifications"}
          </p>
        </div>

        <div className="max-h-60 overflow-y-auto divide-y divide-divider">
          {loading ? (
            <div className="p-4 text-unactive font-text text-sm text-center">
              Loading...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 transition-all font-text text-sm cursor-pointer ${
                  notif.ReadAt ? "bg-white" : "bg-blue-50"
                }`}
              >
                <p className="text-black">{notif.Message}</p>
                <p className="text-unactive text-xs mt-1">
                  {formatTime(notif.created_at)}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-unactive font-text text-sm text-center">
              You're all caught up!
            </div>
          )}
        </div>

        <div className="p-3 text-center border-t border-divider text-primary font-header text-sm hover:underline cursor-pointer">
          {/* View All Notifications */}
          Coming Soon !
        </div>
      </div>

      <NotificationMessageModal
        open={isModalOpen}
        close={() => setIsModalOpen(false)}
        classname="fixed inset-0 z-[999]"
        notification={selectedNotification}
        onDelete={(id) => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

export default NotificationBellPopup;
