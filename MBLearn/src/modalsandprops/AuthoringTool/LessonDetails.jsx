import { faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useFormik } from "formik";
import axiosClient from "MBLearn/src/axios-client";
import { useState, useEffect } from "react";
import SuccessModal from "./SuccessModal";
import ConfirmationModal from "./ConfirmationModal";

const LessonDetails = ({ open, close, lesson, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // console.log("check this out cuz", lesson);
  const lessonDetails = useFormik({
    enableReinitialize: true,
    initialValues: {
      LessonName: lesson?.LessonName || "",
      LessonDescription: lesson?.LessonDescription || "",
      LessonDuration: lesson?.LessonDuration || 30,
    },
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axiosClient.put(`/updateLessonDetails/${lesson?.id}/${lesson?.course_id}`, values);
        if (onUpdate) {
          onUpdate({ ...lesson, ...values });
        }
        setShowSuccessModal(true);
      } catch (error) {
        console.error("Failed to update lesson details:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    close();
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmingExit, setConfirmingExit] = useState(false);

  const isFormDirty = () => {
    return JSON.stringify(lessonDetails.values) !== JSON.stringify(lessonDetails.initialValues);
  };

  const handleAttemptClose = () => {
    if (isFormDirty()) {
      setShowConfirmModal(true);
    } else {
      close();
    }
  };

  const handleConfirmClose = () => {
    setConfirmingExit(true);
    lessonDetails.resetForm();
    setShowConfirmModal(false);
    setConfirmingExit(false);
    close();
  };

  const handleCancelClose = () => {
    setShowConfirmModal(false);
  };

  return (
    <Dialog open={open} onClose={() => {}}>
      <DialogBackdrop
        transition
        className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity
          data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200
          data-[enter]:ease-out data-[leave]:ease-in z-30"
      />
      <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all
              data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300
              data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
              w-[100vw] md:w-[80vw]"
          >
            <form
              onSubmit={lessonDetails.handleSubmit}
              className="bg-white rounded-md h-full p-5 flex flex-col"
            >
              {/* Header */}
              <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between items-center">
                <div>
                  <h1 className="text-primary font-header text-base md:text-2xl">
                    Lesson Details
                  </h1>
                  <p className="text-unactive font-text text-xs md:text-sm">
                    View detailed information about this lesson
                  </p>
                </div>
                <div>
                  <div
                    className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out w-5 h-5 text-xs md:w-8 md:h-8 md:text-base"
                    onClick={handleAttemptClose}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="mt-4 px-4 flex flex-col space-y-4">
                <div>
                  <label
                    htmlFor="LessonName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Lesson Name
                  </label>
                  <input
                    id="LessonName"
                    name="LessonName"
                    type="text"
                    onChange={lessonDetails.handleChange}
                    onBlur={lessonDetails.handleBlur}
                    value={lessonDetails.values.LessonName}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="LessonDescription"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Lesson Description
                  </label>
                  <textarea
                    id="LessonDescription"
                    name="LessonDescription"
                    rows={4}
                    onChange={lessonDetails.handleChange}
                    onBlur={lessonDetails.handleBlur}
                    value={lessonDetails.values.LessonDescription}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="LessonDuration" className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Duration (minutes)
                  </label>
                  <input
                    id="LessonDuration"
                    name="LessonDuration"
                    type="number"
                    min={30}
                    max={360}
                    onChange={(e) => { lessonDetails.setFieldValue("LessonDuration", e.target.value) }}
                    onBlur={lessonDetails.handleBlur}
                    value={lessonDetails.values.LessonDuration}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Suggested duration for learners to complete this lesson.
                  </p>
                </div>
              </div>

              {/* Footer with buttons */}
              <div className="px-4 py-5 mt-6 flex justify-end border-t-4 border-divider">

                <button
                  type="button"
                  onClick={handleAttemptClose}
                  disabled={loading}
                  className="mr-3 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>

      <SuccessModal
        open={showSuccessModal}
        close={handleSuccessClose}
        header="Lesson Updated"
        desc="The lesson details have been successfully updated."
        confirmLabel="Close"
      />
      <ConfirmationModal
        open={showConfirmModal}
        header="Discard Changes?"
        desc="You have unsaved changes. Are you sure you want to exit? Your changes will be lost."
        confirm={handleConfirmClose}
        cancel={() => setShowConfirmModal(false)}
        confirming={confirmingExit}
      />

    </Dialog>
  );
};

export default LessonDetails;
