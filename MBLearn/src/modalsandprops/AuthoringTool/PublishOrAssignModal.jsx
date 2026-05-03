import { useState } from "react";
import AssignViewer from "./AssignViewer";
import ConfirmationModal from "./ConfirmationModal";
import SuccessModal from "./SuccessModal";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faUserPlus, faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import axiosClient from "MBLearn/src/axios-client";
import ReassignViewer from "./ReassignViewer";

const PublishOrAssignModal = ({ open, close, course, onPublishRequest, onReapprovalSubmitted }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitForReApproval = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await axiosClient.post(`/submitForReApproval/${course.id}/`);

      if (onReapprovalSubmitted) {
        onReapprovalSubmitted();
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to submit for re-approval:", err);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    close();
  };

  return (
    <>
      <Dialog open={open} onClose={close}>
        <DialogBackdrop className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-md p-6 w-full max-w-xl shadow-lg relative">
            <div className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={close}>
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </div>

            <h2 className="text-2xl font-header text-primary mb-2">Course Reviewed</h2>
            <p className="text-sm text-gray-600 mb-6">
              This course has been reviewed. What would you like to do next?
            </p>

            <div className="grid gap-4">
              <button className={`bg-primary text-white py-3 rounded-md font-header flex items-center justify-center gap-2 transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryhover cursor-pointer"}`}
                onClick={() => {
                  setShowConfirmModal(true); 
                  close();
                }}
                disabled={loading}
              >
                <FontAwesomeIcon icon={loading ? faSpinner : faUserPlus} spin={loading} />
                <span>{loading ? "Updating Course Status..." : "Submit for Re-Approval"}</span>
              </button>

              <button
                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-header flex items-center justify-center gap-2"
                onClick={() => {
                  onPublishRequest && onPublishRequest();
                  close();
                }}
              >
                <FontAwesomeIcon icon={faBullhorn} />
                <span>Publish Course Now</span>
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <ConfirmationModal
        open={showConfirmModal}
        header="Submit for Re-Approval?"
        desc="The status would be change to for approval. Are you sure you want to continue?"
        confirm={handleSubmitForReApproval}
        cancel={() => setShowConfirmModal(false)}
        confirming={loading}
      />

      <SuccessModal 
        open={showSuccessModal}
        close={handleSuccessConfirm}
        header="Submitted Successfully"
        desc="The course has been set as for re-approval."
        confirmLabel="Close"
      />

      <ReassignViewer 
        open={showAssignModal} 
        close={() => setShowAssignModal(false)} 
        course={course} 
      />
    </>
  );
};

export default PublishOrAssignModal;
