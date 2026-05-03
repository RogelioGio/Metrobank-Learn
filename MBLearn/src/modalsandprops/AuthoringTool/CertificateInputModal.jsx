import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import axiosClient from "MBLearn/src/axios-client";
import SuccessModal from "./SuccessModal";
import ConfirmationModal from "./ConfirmationModal";
import FileErrorModal from "./FileErrorModal";

const MAX_SIGNATURES = 3;

const CertificateInputModal = ({ open, onClose, certificateId, onSignatureUpdate, courseId }) => {
  const [signatures, setSignatures] = useState([]);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState(null);
  const [fileErrorModalOpen, setFileErrorModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!editingSignature && fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, [editingSignature]);

  const fetchSignatureData = async (certificateId) => {
    try {
      const response = await axiosClient.get(`/fetchCertificateSignatures/${certificateId}`);
      setSignatures(response.data || []);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch signature data:", error);
      return [];
    }
  };

  useEffect(() => {
      if (open) {
          fetchSignatureData(certificateId);
      }
  }, [open, certificateId]);

  const isAllowedImage = (file) => {
    if (!file) return true;
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop();
    return allowedExtensions.includes(extension);
  };

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];

    if (file && !isAllowedImage(file)) {
      setFileErrorModalOpen(true);
      formik.setFieldValue("SignatureURL_Path", null); 
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } else {
      formik.setFieldValue("SignatureURL_Path", file);
    }
  };

  const formik = useFormik({
    initialValues: {
      CreditorName: '',
      CreditorPosition: '',
      SignatureURL_Path: null,
    },
    onSubmit: (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);

      function isAllowedImage(file) {
        if (!file) return true;
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        const fileName = file.name.toLowerCase();
        const extension = fileName.split('.').pop();
        return allowedExtensions.includes(extension);
      }
      if (values.SignatureURL_Path && !isAllowedImage(values.SignatureURL_Path)) {
        setFileErrorModalOpen(true);
        setSubmitting(false);
        return;
      }

      const formData = new FormData();

      formData.append('CreditorName', values.CreditorName);
      formData.append('CreditorPosition', values.CreditorPosition);
      if (values.SignatureURL_Path) {
        formData.append('SignatureURL_Path', values.SignatureURL_Path);
      }

      let request;

      if (editingSignature) {
        // Use POST with method spoofing for Laravel to recognize PUT with multipart
        formData.append('_method', 'PUT');

        request = axiosClient.post(
          `/updateCertificateCreditors/${editingSignature.id}/${courseId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        request = axiosClient.post(
          `/uploadCertificateCreditors/${certificateId}/${courseId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      request
        .then((res) => {
          console.log('Response:', res);
          resetForm();
          setEditingSignature(null);
          fetchSignatureData(certificateId);
          setSuccessModalOpen(true);
          if (onSignatureUpdate) onSignatureUpdate();
          if (fileInputRef.current) {
            fileInputRef.current.value = null;
          }
        })
        .catch((error) => {
          if (error.response && error.response.data) {
            console.error('Validation errors:', error.response.data.errors);
            formik.setErrors(error.response.data.errors || {});
          } else {
            console.error('Error:', error);
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
  });

  /// --------------------
  /// Delete Signature
  /// --------------------
  const [showSignatureDeleteModal, setShowSignatureDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowSignatureDeleteModal(true);
  };

  const handleDeleteSignature = async () => {
     setIsConfirming(true);
    try {
      await axiosClient.delete(`/deleteCertificateSignature/${deletingId}`);
      fetchSignatureData(certificateId);
      setShowSignatureDeleteModal(false);
      setDeletingId(null);
      if (onSignatureUpdate) onSignatureUpdate();
    } catch (error) {
      console.error("Failed to delete signature:", error);
      alert("Failed to delete the signature. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    if (editingSignature) {
      formik.setValues({
        CreditorName: editingSignature.CreditorName || '',
        CreditorPosition: editingSignature.CreditorPosition || '',
        SignatureURL_Path: null,
      });
    } else {
      formik.resetForm();
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, [editingSignature]);

return (
  <>
    <Dialog open={open} onClose={onClose}>
      <DialogBackdrop
        transition
        className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"
      />
      <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all
              data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200
              data-[enter]:ease-out data-[leave]:ease-in
              w-[100vw] md:w-[70vw]"
          >
            <div className="bg-white rounded-md h-full p-5 flex flex-col">
              {/* Header */}
              <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between items-center">
                <h1 className="text-primary font-header text-base md:text-2xl">
                  Upload Signatures
                </h1>
                <button
                  onClick={() => {
                    onClose();
                    setEditingSignature(null); // Clear editing on modal close
                    formik.resetForm();
                  }}
                  className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                    w-5 h-5 text-xs md:w-8 md:h-8 md:text-base"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {/* Content */}
              <div className="mx-4 my-4 space-y-4 flex-grow overflow-auto">
                {signatures.length === 0 ? (
                  <p className="text-unactive font-text text-sm md:text-base">
                    No signatures found.
                  </p>
                ) : (
                  signatures.map((signature, index) => (
                    <div
                      key={signature.id || index}
                      className="border border-divider rounded-md p-3 relative"
                    >
                      <p className="font-header text-primary font-semibold">
                        {signature.CreditorName}
                      </p>
                      <p className="text-unactive font-text text-xs md:text-sm">
                        {signature.CreditorPosition}
                      </p>
                      {signature.SignatureURL_Path ? (
                        <img
                          src={`${signature.SignatureURL_Path}`}
                          alt={`Signature of ${signature.CreditorName}`}
                          className="max-h-20 mt-2 rounded"
                        />
                      ) : (
                        <p className="text-unactive font-text text-xs italic mt-1">
                          No image available
                        </p>
                      )}
                      <div className="flex gap-4 mt-2">
                        <button  className="absolute top-2 right-2 text-primary hover:text-primary-dark text-xs md:text-sm flex items-center"
                          onClick={() => setEditingSignature(signature)}
                          type="button"
                        >
                          <FontAwesomeIcon icon={faPen} className="mr-1" />
                          Edit
                        </button>

                        <button className="absolute bottom-2 right-2 text-red-600 hover:text-red-800 text-xs md:text-sm flex items-center"
                          onClick={() => handleDeleteClick(signature.id)}
                          type="button"
                        >
                          <FontAwesomeIcon icon={faTrash} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form */}
              {(signatures.length < MAX_SIGNATURES || editingSignature) && (
                <>
                  {editingSignature && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSignature(null);
                        formik.resetForm();
                      }}
                      className="mb-4 mx-4 text-red-500 hover:underline text-xs md:text-sm"
                    >
                      Cancel Edit
                    </button>
                  )}

                  <form
                    className="grid grid-cols-3 mx-4 py-2 pb-4 gap-4"
                    onSubmit={formik.handleSubmit}
                  >
                    {/* Creditor Name */}
                    <div className="inline-flex flex-col gap-1">
                      <label
                        htmlFor="CreditorName"
                        className="font-header text-xs md:text-sm text-primary"
                      >
                        Creditor Name
                      </label>
                      <input
                        id="CreditorName"
                        name="CreditorName"
                        type="text"
                        value={formik.values.CreditorName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        maxLength={100}
                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                        placeholder="Enter Creditor Name"
                      />
                      {formik.touched.CreditorName && formik.errors.CreditorName ? (
                        <div className="text-red-500 text-xs font-text">
                          {formik.errors.CreditorName}
                        </div>
                      ) : null}
                    </div>

                    {/* Creditor Position */}
                    <div className="inline-flex flex-col gap-1">
                      <label
                        htmlFor="CreditorPosition"
                        className="font-header text-xs md:text-sm text-primary"
                      >
                        Creditor Position
                      </label>
                      <input
                        id="CreditorPosition"
                        name="CreditorPosition"
                        type="text"
                        value={formik.values.CreditorPosition}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        maxLength={100}
                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                        placeholder="Enter Creditor Position"
                      />
                      {formik.touched.CreditorPosition && formik.errors.CreditorPosition ? (
                        <div className="text-red-500 text-xs font-text">
                          {formik.errors.CreditorPosition}
                        </div>
                      ) : null}
                    </div>

                    {/* Signature Upload */}
                    <div className="inline-flex flex-col gap-1">
                      <label
                        htmlFor="SignatureURL_Path"
                        className="font-header text-xs md:text-sm text-primary"
                      >
                        Upload Signature Image
                      </label>
                      <input
                        key={editingSignature ? editingSignature.id : "new"} // changing key resets input
                        id="SignatureURL_Path"
                        name="SignatureURL_Path"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        onBlur={formik.handleBlur}
                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                      />
                      {formik.touched.SignatureURL_Path && formik.errors.SignatureURL_Path ? (
                        <div className="text-red-500 text-xs font-text">
                          {formik.errors.SignatureURL_Path}
                        </div>
                      ) : null}
                    </div>

                    <div className="col-span-3 flex flex-col md:flex-row justify-end gap-4 mt-6 px-4">
                      <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className={`bg-primary border-primary border-2 px-6 py-3 rounded-md flex items-center justify-center text-white transition duration-300 ease-in-out cursor-pointer font-header
                          w-full md:w-auto
                          ${formik.isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-dark hover:border-primary-dark"}`}
                      >
                        {formik.isSubmitting ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                            Saving...
                          </>
                        ) : editingSignature ? (
                          "Update"
                        ) : (
                          "Save"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          setEditingSignature(null);
                          formik.resetForm();
                        }}
                        className="bg-white border-2 border-primary px-6 py-3 rounded-md flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition duration-300 ease-in-out cursor-pointer font-header w-full md:w-auto tracking-wide"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>

    <SuccessModal
      open={successModalOpen}
      close={() => {
        setSuccessModalOpen(false);
      }}
      header={"Success!"}
      desc={"Signatures updated successfully"}
      confirmLabel="Close"
    />

    <ConfirmationModal
      open={showSignatureDeleteModal}
      confirm={handleDeleteSignature}
      cancel={() => setShowSignatureDeleteModal(false)}
      header="Confirm Delete"
      desc="Are you sure you want to delete this signature?"
      confirming={isConfirming}
    />

    <FileErrorModal
      open={fileErrorModalOpen}
      onClose={() => setFileErrorModalOpen(false)}
      header="Invalid File Type"
      desc="Only image files (JPG, JPEG, PNG) are allowed. Please try again."
    />
  </>
);
};


export default CertificateInputModal;
