import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import axiosClient from 'MBLearn/src/axios-client';

const NotificationMessageModal = ({ open, close, classname, notification, onDelete }) => {
  const { id, AssignerName, Message, created_at } = notification || {};
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axiosClient.delete(`/deleteNotification/${id}`);
      onDelete(id);
      close();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} className={classname}>
      <DialogBackdrop
        className="fixed inset-0 bg-gray-500/75 transition-opacity z-40"
      />
      <div className="fixed inset-0 z-40 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
            className="w-[40rem] transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all"
          >
            {/* Header */}
            <div className="bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-md">
              <div className="flex justify-between items-center p-4">
                <DialogTitle className="text-lg md:text-2xl text-white font-header">
                  Notification
                </DialogTitle>
                <div
                  onClick={close}
                  className="border-2 border-white rounded-full text-white flex items-center justify-center hover:bg-white hover:text-primary hover:cursor-pointer transition-all ease-in-out
                  w-6 h-6 md:w-8 md:h-8 md:text-base"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-y-4 font-text">
              <div>
                <p className="text-xs text-unactive">From:</p>
                <p className="text-base md:text-lg">
                  {AssignerName || 'Unknown'}
                </p>
              </div>

              <div>
                <p className="text-xs text-unactive">Message:</p>
                <p className="text-base md:text-lg font-medium">
                  {Message || 'No message available.'}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-xs text-unactive">Sent:</p>
                  <p className="text-sm text-gray-500">
                    {created_at ? new Date(created_at).toLocaleString() : 'Date not available'}
                  </p>
                </div>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-header text-sm flex items-center gap-2 disabled:opacity-60"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Deleting...
                    </>
                  ) : (
                    "Delete Notification"
                  )}
                </button>
              </div>

            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default NotificationMessageModal;
