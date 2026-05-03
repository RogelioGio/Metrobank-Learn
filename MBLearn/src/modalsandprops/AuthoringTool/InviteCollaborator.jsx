import { useEffect, useState } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import axiosClient from "MBLearn/src/axios-client";
import ConfirmationModal from "./ConfirmationModal";

const InviteCollaborator = ({ open, close, courseId, onSubmitRefresh }) => {
  const [smeCreators, setSmeCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fetchSMECreators = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/getCreators/${courseId}`);
      setSmeCreators(response.data);
    } catch (error) {
      console.error("Failed to fetch SME Creators:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSMECreators();
      setSelectedUserIds([]);
    }
  }, [open]);

  const handleUserClick = (user) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(user.id)) {
        return prev.filter((id) => id !== user.id);
      } else {
        return [...prev, user.id];
      }
    });
  };

  const handleInviteClick = () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmInvite = async () => {
      setConfirming(true);

      try {
          const selectedUsers = smeCreators.filter(user => selectedUserIds.includes(user.id));

          for (const user of selectedUsers) {
              await axiosClient.post(`/inviteSMECreatorCollaboration/${courseId}`, {
                  PermittedID: user.id,
                  course_id: courseId,
              });
          }

          setConfirmModalOpen(false);
          onSubmitRefresh();
          close();
      } catch (error) {
          console.error("Failed to invite users:", error);
      } finally {
          setConfirming(false);
      }
  };


  return (
    <>
      <Dialog open={open} onClose={close}>
        <DialogBackdrop
          transition
          className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"
        />
        <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                w-[100vw]
                md:w-[80vw]"
            >
              <div className="bg-white rounded-md h-full p-5 flex flex-col">
                <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between items-center">
                  <div>
                    <h1 className="text-primary font-header text-base md:text-2xl">Add Users</h1>
                    <p className="text-unactive font-text text-xs md:text-sm">
                      Select one or more users to invite as collaborators
                    </p>
                  </div>
                  <div>
                    <div
                      className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out w-5 h-5 text-xs md:w-8 md:h-8 md:text-base"
                      onClick={close}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-auto max-h-[60vh] px-4">
                  {loading && <p>Loading SME Creators...</p>}

                  {!loading && smeCreators.length === 0 && <p>No More SME Creators found.</p>}

                  {!loading && smeCreators.length > 0 && (
                    <ul className="space-y-3">
                      {smeCreators.map((user) => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <li
                            key={user.id}
                            onClick={() => handleUserClick(user)}
                            className={`flex items-center space-x-4 p-3 border rounded shadow-sm hover:shadow-md transition cursor-pointer ${
                              isSelected ? "bg-blue-100 border-blue-500" : "bg-white"
                            }`}
                          >
                            <img
                              src={user.profile_image || "https://ui-avatars.com/api/?name=User&background=ccc&color=fff"}
                              alt={`${user.first_name} ${user.last_name}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />

                            <div className="flex flex-col">
                              <p className="font-semibold text-lg">
                                {user.first_name} {user.middle_name} {user.last_name} {user.name_suffix || ""}
                              </p>

                              <p className="text-sm text-gray-600">{user.user_credentials?.MBemail}</p>

                              <p className="text-sm text-gray-500">
                                Employee ID: <span className="font-medium">{user.employeeID}</span>
                              </p>

                              <p className="text-sm text-gray-500">
                                {user.department?.department_name} — {user.title?.title_name}
                              </p>

                              <p className="text-sm text-gray-400">
                                Branch: {user.branch?.branch_name} ({user.city?.city_name})
                              </p>

                              <p
                                className={`mt-1 text-xs font-semibold ${
                                  user.status === "Active" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                Status: {user.status}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                    onClick={close}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={selectedUserIds.length === 0}
                    className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={handleInviteClick}
                  >
                    Invite {selectedUserIds.length} User{selectedUserIds.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <ConfirmationModal
        open={confirmModalOpen}
        confirm={handleConfirmInvite}
        cancel={() => setConfirmModalOpen(false)}
        header="Confirm Invitation"
        desc={`Are you sure you want to invite ${selectedUserIds.length} user${selectedUserIds.length !== 1 ? "s" : ""}?`}
        confirming={confirming}
      />
    </>
  );
};

export default InviteCollaborator;
