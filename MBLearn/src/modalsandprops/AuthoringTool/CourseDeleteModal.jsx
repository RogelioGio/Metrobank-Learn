import { useState, useEffect } from "react";
import { faCircleExclamation, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

const CourseDeleteModal = ({ open, proceed, cancel, header, desc, deleting }) => {
  const [confirmationText, setConfirmationText] = useState("");

  const isConfirmed = confirmationText.toLowerCase() === "delete course".toLowerCase();

  useEffect(() => {
    if (!open) setConfirmationText("");
  }, [open]);

  return (
<Dialog open={open} onClose={() => {}}>
  <DialogBackdrop
    transition
    className={`backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30
      ${deleting ? "pointer-events-none" : ""}
    `}
  />
  <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
    <div className="flex min-h-full items-center justify-center p-4">
      <DialogPanel
        transition
        aria-busy={deleting}
        className={`relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
          w-[80vw] sm:w-[30vw]`}
      >
        {/* This wrapper disables all interaction when deleting */}
        <div className={deleting ? "pointer-events-none select-none opacity-70" : ""}>
          <div className="bg-white rounded-md h-full w-full p-5 flex flex-col items-center gap-4">
                <div>
                  <div className="bg-primarybg w-28 h-28 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCircleExclamation} className="text-primary text-6xl" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="font-header text-2xl text-primary">{header}</p>
                  <p className="font-text text-xs">{desc}</p>
                </div>

                {/* Confirmation Input */}
                <div className="w-full">
                  <p className="mb-1 text-sm font-semibold text-gray-700">
                    Please type <span className="font-mono bg-gray-200 px-1 rounded">Delete Course</span> to confirm:
                  </p>
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Type here to confirm"
                    disabled={deleting}
                    autoFocus
                  />
                </div>

                <div className="w-full flex flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    className="bg-white border-primary border-2 w-full py-3 rounded-md text-primary font-header hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out cursor-pointer"
                    onClick={cancel}
                    disabled={deleting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className={`bg-primary border-primary border-2 w-full py-3 rounded-md text-white font-header transition-all ease-in-out cursor-pointer flex items-center justify-center
                      ${
                        !isConfirmed || deleting
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:border-primaryhover hover:bg-primaryhover"
                      }`}
                    onClick={() => {
                      if (deleting || !isConfirmed) return;
                      proceed();
                    }}
                    disabled={!isConfirmed || deleting}
                  >
                    {deleting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-lg mr-2" />
                        Deleting...
                      </>
                    ) : (
                      "Proceed"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default CourseDeleteModal;
