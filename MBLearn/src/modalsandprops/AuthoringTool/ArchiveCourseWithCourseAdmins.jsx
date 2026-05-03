import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { faXmark, faArchive, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import SuccessModal from "./SuccessModal";
import ConfirmationModal from "./ConfirmationModal";
import axiosClient from "MBLearn/src/axios-client";

const ArchiveCourseWithCourseAdmins = ({ open, close, course }) => {
  const [archiving, setArchiving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [courseAdmins, setCourseAdmins] = useState([]);

  const fetchAssignedCourseAdmins = async (courseId) => {
    try {
      const response = await axiosClient.get(`/get-assigned-course-admins/${courseId}`);
      setCourseAdmins(response.data.data);
    } catch (error) {
      console.error("Failed to fetch course admins:", error);
      setCourseAdmins([]);
    }
  };

  useEffect(() => {
    if (open && course?.id) {
      fetchAssignedCourseAdmins(course.id);
    } else {
      setCourseAdmins([]);
    }
  }, [open, course]);

  const formik = useFormik({
    initialValues: {
      reason: "",
      willArchiveAt: new Date().toISOString().slice(0, 10),
    },
    onSubmit: () => {},
  });

  const handleArchiveCourse = () => {
    setArchiving(true);
    axiosClient
      .post(`/archiveCourseWithCourseAdmins/${course.CourseID}`, {
        reason: formik.values.reason,
        WillArchiveAt: new Date(formik.values.willArchiveAt).toISOString(), 
      })
      .then(() => {
        setArchiving(false);
        setSuccessOpen(true);
        formik.resetForm();
        close();
      })
      .catch((error) => {
        setArchiving(false);
        console.error("Error archiving course:", error);
      });
  };

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onClose={() => {}}>
        <DialogBackdrop className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 z-30 transition-opacity" />
        <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all w-[80vw] min-h-[700px]">
              <div className="bg-white h-full p-5 flex flex-col">
                {/* Header */}
                <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between items-center">
                  <div>
                    <h1 className="text-primary font-header text-base md:text-2xl">
                      Archive Course
                    </h1>
                    <p className="text-unactive font-text text-xs md:text-sm">
                      Confirm archiving this course. You can optionally leave a message or reason.
                    </p>
                  </div>
                  <div
                    className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out w-5 h-5 text-xs md:w-8 md:h-8 md:text-base"
                    onClick={() => {
                      formik.resetForm();
                      close();
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 px-4 py-4">
                  <div className="col-span-4 md:col-span-2 flex flex-col gap-4">
                    <div>
                      <label className="font-header text-sm text-primary mb-1 block">
                        Select Archive Date
                      </label>
                      <input
                        type="date"
                        className="w-full border border-divider rounded-md p-3 font-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        name="willArchiveAt"
                        value={formik.values.willArchiveAt}
                        onChange={formik.handleChange}
                        min={new Date().toISOString().slice(0, 10)}
                      />
                    </div>

                    <div>
                      <label className="font-header text-sm text-primary mb-1 block">
                        Reason for Archival
                      </label>
                      <textarea
                        rows={4}
                        className="w-full border border-divider rounded-md p-3 font-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Add a reason or note for archiving (optional)..."
                        value={formik.values.reason}
                        onChange={formik.handleChange}
                        name="reason"
                      />
                    </div>
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    {courseAdmins.length > 0 ? (
                      <div className="space-y-2 max-h-[40rem] overflow-y-auto px-4 py-2">
                        <p className="text-sm text-unactive font-text mb-2">
                          <strong>Note:</strong> {courseAdmins.length} course admin(s) will be notified upon archive.
                        </p>
                        {courseAdmins.map((admin, index) => (
                          <div
                            key={index}
                            className="p-2 border border-divider rounded-md bg-gray-50 flex space-x-4"
                          >
                            <img
                              src={admin.profile_image || "/default-profile.png"}
                              alt={`${admin.first_name} ${admin.last_name}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />

                            <div>
                              <p className="font-header text-sm text-primary">
                                {admin.first_name} {admin.middle_name ?? ""} {admin.last_name}{" "}
                                {admin.name_suffix ?? ""}
                              </p>

                              <p className="font-text text-xs text-unactive">
                                ID: {admin.employeeID || "N/A"}
                              </p>

                              <p className="font-text text-xs text-unactive">
                                Roles:{" "}
                                {admin.roles?.map((role) => role.role_name).join(", ") || "N/A"}
                              </p>

                              <p className="font-text text-xs text-unactive">
                                Title: {admin.title?.title_name || "N/A"}
                              </p>

                              <p className="font-text text-xs text-unactive">
                                Department: {admin.department?.department_name || "N/A"}
                              </p>

                              <p className="font-text text-xs text-unactive">
                                Branch: {admin.branch?.branch_name || "N/A"}, City:{" "}
                                {admin.city?.city_name || "N/A"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="col-span-4 text-xs text-unactive font-text italic px-4 py-2">
                        No course admins assigned.
                      </p>
                    )}
                  </div>

                  <div className="col-span-4 flex justify-end mt-4">
                    <div
                      className={`flex flex-row bg-primary text-white font-header justify-center items-center gap-4 text-lg py-3 px-6 rounded-md transition-colors ease-in-out ${
                        archiving
                          ? "opacity-50 hover:cursor-not-allowed"
                          : "hover:cursor-pointer hover:bg-primaryhover"
                      }`}
                      onClick={() => {
                        if (!archiving) setConfirmArchiveOpen(true);
                      }}
                    >
                      {archiving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <p>Archiving...</p>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faArchive} />
                          <p>Archive Course</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <SuccessModal
        open={successOpen}
        close={() => setSuccessOpen(false)}
        header="Course Archived"
        desc={`"${course?.CourseName}" has been successfully archived.`}
        confirmLabel="Close"
      />

      <ConfirmationModal
        open={confirmArchiveOpen}
        cancel={() => setConfirmArchiveOpen(false)}
        confirm={() => {
          setConfirmArchiveOpen(false);
          handleArchiveCourse();
        }}
        header="Confirm Archive"
        desc={`Are you sure you want to archive the course "${course?.CourseName}"? ${
          courseAdmins.length > 0
            ? `${courseAdmins.length} Course Admin(s) will be notified.`
            : "No Course Admins are assigned to this course."
        }`}
        confirming={archiving}
      />
    </>
  );
};

export default ArchiveCourseWithCourseAdmins;
