import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { faSpinner, faXmark, faUserCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFormik } from "formik"
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area"
import { useEffect, useState } from "react"
import axiosClient from "MBLearn/src/axios-client"
import SuccessModal from "./SuccessModal"
import ConfirmationModal from "./ConfirmationModal"

const ReassignViewer = ({ open, close, course, onReassignSubmitted }) => {
  const [previousApprovers, setPreviousApprovers] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [successOpen, setSuccessOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const formik = useFormik({
    initialValues: {
      reason: ""
    },
    validate: (values) => {
      const errors = {}
      if (!values.reason.trim()) {
        errors.reason = "Reason is required"
      }
      return errors
    },
    onSubmit: () => {
      setConfirmOpen(true)
    }
  })

  useEffect(() => {
    if (open && course?.id) { 
      setLoading(true)
      axiosClient.get(`/getPreviousApprovers/${course.id}`)
        .then(({ data }) => {
          setPreviousApprovers(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching previous approvers:", error)
          setLoading(false)
        })
    } else {
      setPreviousApprovers([])
      formik.resetForm()
    }
  }, [open, course?.id])

  const handleConfirm = () => {
    setConfirmOpen(false)
    setSubmitting(true)
    axiosClient.post(`/reassignViewers/${course.id}`, {
        reason: formik.values.reason,
        previousApprovers: previousApprovers.map((a) => a.user_info_id)
      })
      .then(() => {
        setSubmitting(false)
        setSuccessOpen(true)
        if (onReassignSubmitted) {
          onReassignSubmitted();
        }
        close()
      })
      .catch((error) => {
        console.error("Error submitting reassign:", error)
        setSubmitting(false)
      })
  }

  return (
    <>
      <Dialog open={open} onClose={() => {}}>
        <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
        <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel transition className="relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in w-[80vw]">
              <div className="bg-white rounded-md h-full p-5 flex flex-col">
                <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between items-center">
                  <div>
                    <h1 className="text-primary font-header
                        text-base
                        md:text-2xl"
                    >
                      Submit Course for Re-Approval
                    </h1>
                    <p className="text-unactive font-text
                        text-xs
                        md:text-sm"
                    >
                      This course has been approved before. Please provide a reason for re-submission for re-approval.
                    </p>
                  </div>
                  <div>
                    <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out w-5 h-5 text-xs md:w-8 md:h-8 md:text-base"
                      onClick={() => {
                        formik.resetForm()
                        close()
                      }}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 grid-rows-[min-content,1fr,min-content] py-2 px-4">
                  <div className="col-span-4">
                    <p className="font-text text-unactive text-xs mb-1">
                      Previous Approvers:
                    </p>
                    <ScrollArea className="bg-gray-50 rounded-md max-h-[400px] border border-divider p-4 space-y-4">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-full h-20 bg-white border animate-pulse rounded-md"
                          />
                        ))
                      ) : previousApprovers.length === 0 ? (
                        <p className="text-center text-unactive font-text">No previous approvers found.</p>
                      ) : (
                        previousApprovers.map((approver) => (
                          <div className="flex flex-row items-start gap-4 bg-white p-4 rounded-md shadow border border-divider"
                            key={approver.id}
                          >
                            <div className="min-h-12 min-w-12 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                              {approver.profile_image ? (
                                <img
                                  src={approver.profile_image}
                                  alt={`${approver.first_name} ${approver.last_name}`}
                                  className="h-full w-full object-cover rounded-full"
                                />
                              ) : (
                                `${approver.first_name[0]}${approver.last_name[0]}`
                              )}
                            </div>

                            <div className="flex flex-col flex-grow">
                              <p className="font-header text-primary text-lg">
                                {approver.first_name} {approver.middle_name || ""} {approver.last_name}
                              </p>
                              <p className="text-unactive text-xs mb-1">
                                ID: {approver.employeeID} &bull; {approver.user_credentials.MBemail}
                              </p>

                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    approver.response === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : approver.response === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {approver.response
                                    ? approver.response.charAt(0).toUpperCase() + approver.response.slice(1)
                                    : "Pending"}
                                </span>
                                <span className="text-xs text-gray-500 italic">
                                  {approver.timestamp
                                    ? new Date(approver.timestamp).toLocaleString()
                                    : ""}
                                </span>
                              </div>
                              {approver.comment && (
                                <p className="mt-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md italic text-gray-700 text-sm leading-relaxed">
                                  “{approver.comment}”
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </div>

                  <div className="col-span-4 py-4">
                    <label className="font-header text-primary block mb-1"
                      htmlFor="reason"
                    >
                      Reason for Re-Approval
                    </label>
                    <textarea className={`w-full rounded-md border border-divider px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
                        formik.errors.reason && formik.touched.reason
                          ? "border-red-500"
                          : ""
                      }`}
                      id="reason"
                      name="reason"
                      rows={4}
                      placeholder="Enter your reason here..."
                      value={formik.values.reason}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.reason && formik.touched.reason && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.reason}</p>
                    )}
                  </div>

                  <div className="col-span-4 flex justify-end gap-4">
                    <button className="px-4 py-2 rounded-md border border-primary text-primary font-header hover:bg-primary hover:text-white transition"
                      onClick={() => {
                        formik.resetForm()
                        close()
                      }}
                      disabled={submitting}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button className={`px-4 py-2 rounded-md bg-primary text-white font-header hover:bg-primaryhover transition disabled:opacity-50`}
                      onClick={() => formik.handleSubmit()}
                      disabled={submitting || !formik.values.reason.trim()}
                      type="button"
                    >
                      {submitting ?
                        <FontAwesomeIcon icon={faSpinner} spin />
                      :
                        "Submit for Re-Approval"
                      }
                    </button>
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
        header="Re-Approval Submitted"
        desc={`Successfully submitted the course for re-approval.`}
        confirmLabel="Close"
      />
      <ConfirmationModal
        open={confirmOpen}
        cancel={() => setConfirmOpen(false)}
        confirm={handleConfirm}
        header="Confirm Re-Approval Submission"
        desc={`Are you sure you want to submit this course for re-approval?`}
        confirming={submitting}
      />
    </>
  )
}

export default ReassignViewer
