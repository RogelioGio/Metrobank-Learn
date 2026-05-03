import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileArrowUp, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons"
import * as Yup from 'yup';
import axiosClient from "MBLearn/src/axios-client"
import { useFormik } from "formik";
import { useEffect, useState } from "react"
import SuccessModal from "./SuccessModal";
import FileErrorModal from "./FileErrorModal";
import ConfirmationModal from "./ConfirmationModal";

const VideoAttachmentModal = ({open, close, attachmentId, onSubmit}) => {

    const [fileName, setFileName] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [fileErrorModalOpen, setFileErrorModalOpen] = useState(false);

    /// --------------------
    /// Unsaved Changes
    /// --------------------
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmingExit, setConfirmingExit] = useState(false);

    const isFormDirty = () => {
        const valuesChanged = JSON.stringify(formik.values) !== JSON.stringify(formik.initialValues);
        const fileNameChanged = fileName !== '';
        return valuesChanged || fileNameChanged;
    };

    const handleDeleteFile = () => {
        if (attachmentId) {
            return axiosClient.delete(`/deleteVideoAttachment/${attachmentId}`)
                .then(() => console.log('Attachment deleted on backend'))
                .catch(err => console.error('Error deleting attachment:', err))
                .finally(() => {
                    formik.setFieldValue('VideoPath', '');
                });
        } else {
            formik.setFieldValue('VideoPath', '');
            return Promise.resolve();
        }
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

        handleDeleteFile()
            .finally(() => {
                formik.resetForm({ values: formInitialValues });
                setFileName('');
                setUploadProgress(0);
                setShowSuccessModal(false);
                setFileErrorModalOpen(false);
                setSaving(false);

                setTimeout(() => {
                    setConfirmingExit(false);
                    setShowConfirmModal(false);
                    close();
                }, 500);
            });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];

        if (!file.type.startsWith('video/')) {
            setFileErrorModalOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setSaving(true);
        setUploadProgress(0);

        let simulatedProgress = 0;
        let progressInterval;

        const startSimulatedProgress = () => {
            progressInterval = setInterval(() => {
                simulatedProgress += 1;
                setUploadProgress(simulatedProgress);
                if (simulatedProgress >= 99) {
                    clearInterval(progressInterval);
                }
            }, 30);
        };

        try {
            startSimulatedProgress();

            const response = await axiosClient.post(`/uploadVideoFile/${attachmentId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const realPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (realPercent >= 99) {
                        clearInterval(progressInterval);
                        setUploadProgress(realPercent);
                    }
                }
            });

            setUploadProgress(100);

            const filePath = response.data?.FilePath || response.data?.path || response.data?.url;

            formik.setFieldValue('VideoPath', filePath);
            setFileName(file.name);

        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setTimeout(() => {
                setSaving(false);
                setUploadProgress(0);
            }, 1000);
        }
    };

    /// --------------------
    /// Upload FIle
    /// --------------------
    const [formInitialValues, setFormInitialValues] = useState({
        VideoName: '',
        VideoPath: '',
        AttachmentType: '',
        AttachmentDescription: '',
        AttachmentDuration: 0,
    });

    const formik = useFormik({
        initialValues: formInitialValues,
        validationSchema: Yup.object({
            AttachmentDuration: Yup.number()
                .required('Duration is required')
                .min(10, 'Duration must be at least 10 minutes')
                .max(360, 'Duration cannot exceed 360 minutes'),
            }),
        onSubmit: (values) => {
            setSaving(true);
            axiosClient.put(`/updateVideoAttachment/${attachmentId}`, values)
            .then(() => {
                setShowSuccessModal(true);
                if (onSubmit) {
                    onSubmit(); 
                }
            })
            .catch((error) => console.error('The Error: ', error))
            .finally(() => setSaving(false));
        },
    });
    
    const fetchAttachments = () => {
        setLoading(true);
        axiosClient.get(`/fetchAttachment/${attachmentId}`)
        .then(({ data }) => {
            formik.setValues({
                VideoName: data.VideoName || '',
                VideoPath: data.VideoPath || '',
                AttachmentDescription: data.AttachmentDescription || '',
                AttachmentType: data.AttachmentType || '',
                AttachmentDuration: data.AttachmentDuration || '',
            });
            setFormInitialValues(data);
            formik.setValues(data);
            setFileName('');
        })
        .catch(err => {
            if (axios.isCancel(err)) {
            console.log("Request canceled", err.message);
            } else {
            console.error("Failed to fetch attachment", err);
            }
        })
        .finally(() => {
            setLoading(false);
        });
    }

    useEffect(() => {
    if (open && attachmentId) {
        setFileName('');
        fetchAttachments();
    }
    }, [open, attachmentId]);

    // clear the fields
    useEffect(() => {
        if (formik.values.AttachmentType && formInitialValues.AttachmentType !== formik.values.AttachmentType) {
            formik.setFieldValue('VideoPath', '');
            setFileName('');
        }
    }, [formik.values.AttachmentType, formInitialValues.AttachmentType]);

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        close();
    };

    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                            w-[50vw]'>
                                <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                    <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                        <div>
                                            <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Video Attachment</h1>
                                            <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Customize video block by uploading video or attach an link of a video</p>
                                        </div>
                                        <div className="">
                                            <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                            w-5 h-5 text-xs
                                                            md:w-8 md:h-8 md:text-base"
                                                onClick={handleAttemptClose}>
                                                <FontAwesomeIcon icon={faXmark}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="py-2">
                                        <form className="flex flex-col px-4" onSubmit={formik.handleSubmit}>
                                            <div className="inline-flex flex-col gap-1 w-full py-2">
                                                <label htmlFor="VideoName" className="font-text  text-xs flex flex-row justify-between">
                                                    <p>Video Attachment Name <span className="text-red-500">*</span></p>
                                                </label>
                                                <input type="text" name="VideoName"
                                                        value={formik.values.VideoName}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        disabled={saving || loading}
                                                        maxLength={50}
                                                        className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                {/* {formik.touched.firstname && formik.errors.firstname ? (<div className="text-red-500 text-xs font-text">{formik.errors.firstname}</div>):null} */}
                                            </div>
                                            <div className="inline-flex flex-col gap-1 w-full py-2">
                                                <label htmlFor="AttachmentDescription" className="font-text  text-xs flex flex-row justify-between">
                                                    <p>Attachment Description <span className="text-red-500">*</span></p>
                                                </label>
                                                <textarea
                                                    name="AttachmentDescription"
                                                    id="course_outcomes"
                                                    value={formik.values.AttachmentDescription}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    disabled={saving || loading}
                                                    className='h-32 font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary resize-none'></textarea>
                                                {/* {formik.touched.firstname && formik.errors.firstname ? (<div className="text-red-500 text-xs font-text">{formik.errors.firstname}</div>):null} */}
                                            </div>
                                            <div className="inline-flex flex-col gap-1 w-full py-2">
                                                <label htmlFor="name" className="font-text  text-xs flex flex-row justify-between">
                                                    <p>Attachment Type <span className="text-red-500">*</span></p>
                                                </label>
                                                <div className="grid grid-cols-1">
                                                    <select name="AttachmentType" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                        value={formik.values.AttachmentType}
                                                        onChange={async (e) => {
                                                            const newType = e.target.value;
                                                            const oldType = formik.values.AttachmentType;

                                                            if (newType !== oldType) {
                                                            await handleDeleteFile();
                                                            formik.setFieldValue('AttachmentType', newType);
                                                            formik.setFieldValue('VideoPath', '');
                                                            }
                                                        }}
                                                        onBlur={formik.handleBlur}
                                                        disabled={saving || loading}>
                                                        <option value="">Select Item Type</option>
                                                        <option value="link">Links</option>
                                                        <option value="upload">Upload</option>
                                                    </select>
                                                    <svg className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <div className="inline-flex flex-col gap-1 w-full py-2">
                                                <label htmlFor="AttachmentDuration" className="font-text text-xs flex flex-row justify-between">
                                                    <p>Suggested Duration <span className="text-red-500">*</span></p>
                                                </label>
                                                <input
                                                    type="number"
                                                    id="AttachmentDuration"
                                                    name="AttachmentDuration"
                                                    placeholder="Enter duration in minutes"
                                                    className="appearance-none font-text border border-divider rounded-md p-2 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                                                    value={formik.values.AttachmentDuration}
                                                    onChange={ (e) => {formik.setFieldValue("AttachmentDuration", e.target.value)} }
                                                    min={10}
                                                    max={360}
                                                    onBlur={formik.handleBlur}
                                                    disabled={saving || loading}
                                                />
                                                {formik.touched.AttachmentDuration && formik.errors.AttachmentDuration && (
                                                    <p className="text-red-500 text-xs mt-1">{formik.errors.AttachmentDuration}</p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Suggested duration for learners to complete this attachment.
                                                </p>
                                            </div>
                                            {
                                                formik.values.AttachmentType === "link" ?
                                                    <div className="inline-flex flex-col gap-1 w-full py-2">
                                                    <label htmlFor="VideoPath" className="font-text text-xs flex flex-row justify-between">
                                                        <p>
                                                            Video Link Attachment <span className="text-red-500">*</span>
                                                        </p>
                                                    </label>
                                                    <input className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                        type="text"
                                                        name="VideoPath"
                                                        value={formik.values.VideoPath}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        disabled={saving || loading}
                                                        maxLength={500}
                                                    />
                                                    </div>
                                                : 
                                                formik.values.AttachmentType === "upload" ?
                                                    formik.values.VideoPath ?
                                                    <div className="inline-flex flex-col gap-1 w-full py-2">
                                                        <label className="font-text text-xs flex flex-row justify-between">
                                                            <p>Uploaded Video</p>
                                                        </label>
                                                        <a className="text-primary underline break-all"
                                                            href={`${formik.values.VideoPath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {fileName || formik.values.VideoName || "View uploaded video"}
                                                        </a>
                                                        <button className="mt-2 py-2 w-full border-2 border-red-500 rounded-md text-red-500 font-header text-center shadow-md hover:bg-red-500 hover:text-white transition-all ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                                            type="button"
                                                            disabled={saving || loading}
                                                            onClick={() => {
                                                                formik.setFieldValue("VideoPath", "");
                                                                setFileName("");
                                                            }}
                                                        >
                                                            Replace File
                                                        </button>
                                                    </div>
                                                    :
                                                    <label className="border-2 border-dashed border-divider bg-gray-100 rounded-md p-5 flex flex-col items-center justify-center gap-2 h-24 cursor-pointer hover:bg-gray-200 transition-all ease-in-out"
                                                        htmlFor="video-upload"
                                                    >
                                                        <FontAwesomeIcon icon={faFileArrowUp} className="text-2xl text-gray-500" />
                                                        <p className="font-text text-sm text-unactive">
                                                            {fileName ? fileName : "Click to upload or drag and drop"}
                                                            </p>
                                                            <input
                                                            id="video-upload"
                                                            type="file"
                                                            accept="video/*"
                                                            disabled={saving || loading}
                                                            className="hidden"
                                                            onChange={handleFileUpload}
                                                        />
                                                    </label>
                                                : 
                                                null
                                            }
                                            {saving && (
                                            <>
                                                <p className="text-sm text-gray-500">
                                                {uploadProgress < 100
                                                    ? `Uploading... ${uploadProgress}%`
                                                    : 'Processing file upload...'}
                                                </p>
                                                <div className="w-full bg-gray-200 rounded h-2 my-2 overflow-hidden">
                                                <div
                                                    className="bg-primary h-2 transition-all"
                                                    style={{ width: `${uploadProgress}%` }}
                                                    role="progressbar"
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-valuenow={uploadProgress}
                                                />
                                                </div>
                                            </>
                                            )}
                                        </form>
                                        <div className="flex flex-row justify-between gap-2 mx-4 py-2 pt-4">
                                            <div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                                onClick={handleAttemptClose}>
                                                <p className="font-header">Cancel</p>
                                            </div>
                                           <div
                                            className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center items-center shadow-md bg-primary text-white hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover transition-all ease-in-out font-header"
                                            onClick={() => !saving && formik.handleSubmit()}
                                            >
                                            {saving ? 
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                                Saving . . .
                                            </>
                                            : 
                                                <>Save</>
                                            }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        </DialogPanel>
                    </div>
                </div>

                <SuccessModal
                    open={showSuccessModal}
                    close={handleSuccessClose}
                    header="Video Updated"
                    desc="Your video attachment has been successfully updated."
                    confirmLabel="Close"
                />

                <FileErrorModal
                    open={fileErrorModalOpen}
                    onClose={() => setFileErrorModalOpen(false)}
                    header="Invalid File Type"
                    desc="Only video files (MP4, MOV, AVI, MKV) are allowed. Please try again."
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
}

export default VideoAttachmentModal
