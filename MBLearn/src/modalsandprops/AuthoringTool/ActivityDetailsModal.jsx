import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

export default function ActivityDetailsModal({ open, close, selectedLog }) {
  if (!open || !selectedLog) return null;

  const rawDate = selectedLog.created_at || selectedLog.timestamp;
  const cleanedDateStr = rawDate ? rawDate.replace(/\.\d{6}/, '') : null;
  const date = cleanedDateStr ? new Date(cleanedDateStr) : null;

  const details = selectedLog.Details || {};

  console.log(details);

  return (
    <Dialog open={open} onClose={() => {}} className="fixed inset-0 z-50 overflow-y-auto">
      <DialogBackdrop
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
            className="w-[40rem] transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all
            data-[closed]:translate-y-4 data-[closed]:opacity-0
            data-[enter]:duration-300 data-[leave]:duration-200
            data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-md p-4 flex justify-between items-center">
              <DialogTitle className="text-white font-header text-xl">Activity Details</DialogTitle>
              <button
                onClick={close}
                aria-label="Close modal"
                className="border-2 border-white rounded-full text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all ease-in-out
                  w-6 h-6 md:w-8 md:h-8 md:text-base"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-gray-700 font-sans text-sm">
              <p><strong>Action:</strong> {selectedLog.Action}</p>
              <p><strong>Course Name:</strong> {details['Course Name'] || 'N/A'}</p>
              <p><strong>Date:</strong> {date ? date.toLocaleDateString() : "Invalid Date"}</p>
              <p><strong>Time:</strong> {date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Date"}</p>

              {(details['Old Overview'] || details['New Overview']) && (
                <div>
                  <p className="font-semibold">Overview Changes:</p>
                  <p><strong>Old:</strong> {details['Old Overview'] || '-'}</p>
                  <p><strong>New:</strong> {details['New Overview'] || '-'}</p>
                </div>
              )}

              {(details['OldObjective'] || details['NewObjective']) && (
                <div>
                  <p className="font-semibold mt-4">Objective Changes:</p>
                  <p><strong>Old:</strong> {details['OldObjective'] || '-'}</p>
                  <p><strong>New:</strong> {details['NewObjective'] || '-'}</p>
                </div>
              )}

              {details.OldImagePath !== undefined && (
                <div>
                  <p><strong>Old Banner Image:</strong></p>
                  <img
                    src={details.OldImagePath}
                    alt="Old Course Banner"
                    className="max-w-full max-h-40 rounded-md border border-gray-300"
                  />
                </div>
              )}

              {details.NewImagePath !== undefined && (
                <div>
                  <p><strong>New Banner Image:</strong></p>
                  <img
                    src={details.NewImagePath}
                    alt="New Course Banner"
                    className="max-w-full max-h-40 rounded-md border border-gray-300"
                  />
                </div>
              )}

              {details['ModuleTitle'] && (
                <p><strong>Module Title:</strong> {details['ModuleTitle']}</p>
              )}

              {details['ModuleType'] && (
                <p>
                  <strong>Module Type:</strong>{" "}
                  {details['ModuleType'].toLowerCase() === "module"
                    ? "Lesson"
                    : details['ModuleType'].toLowerCase() === "assessment"
                    ? "Assessment"
                    : details['ModuleType']}
                </p>
              )}
              {details['OrderPosition'] !== undefined && (
                <p><strong>Order Position:</strong> {details['OrderPosition']}</p>
              )}

              {details['Permitted User Name'] && (
                <p><strong>Permitted User:</strong> {details['Permitted User Name']}</p>
              )}

              {details.Permissions && details.Permissions.length > 0 && (
                <div>
                  <p className="font-semibold">Permissions:</p>
                  <ul className="list-disc list-inside">
                    {details.Permissions.map((perm, idx) => (
                      <li key={idx}>{perm}</li>
                    ))}
                  </ul>
                </div>
              )}

              {details['Assigned Users Count'] !== undefined && (
                <p><strong>Assigned Users Count:</strong> {details['Assigned Users Count']}</p>
              )}

              {details['Assigned Users'] && (
                <div>
                  <p className="font-semibold">Assigned Users:</p>
                  <ul className="list-disc list-inside">
                    {details['Assigned Users'].split(', ').map((user, idx) => (
                      <li key={idx}>{user}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
