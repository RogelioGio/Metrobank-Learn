import React from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const LessonCollaborationModal = ({ isOpen, onClose, contribution, contributionNumber }) => {
  if (!contribution) return null;

  return (
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />

        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel className="w-[800px] max-w-full min-h-[400px] max-h-[90vh] transform overflow-auto rounded-lg bg-white text-left shadow-xl transition-all flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-md">
              <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-header text-white text-base md:text-2xl">
                    Contribution {contributionNumber}
                  </h2>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    aria-label="Close modal"
                    className="border-2 border-white rounded-full text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all ease-in-out
                      w-6 h-6 text-sm md:w-8 md:h-8 md:text-base"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                <p className="text-xs text-white font-text break-words">
                  By {contribution.User} on{" "}
                  {contribution.Date ? new Date(contribution.Date).toLocaleString() : ""}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 overflow-auto">
              <p className="text-sm text-unactive">
                {/* Placeholder for contribution details */}
                This is a summary placeholder for Contribution {contributionNumber}.
              </p>
            </div>

            {/* Footer with Accept/Reject */}
            <div className="flex justify-end gap-3 p-4 border-t border-divider">
              <button
                onClick={() => onReject?.(contribution)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Reject Changes
              </button>
              <button
                onClick={() => onAccept?.(contribution)}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Accept Changes
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    );
  };

export default LessonCollaborationModal;
