import { faImage, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useFormik } from "formik"
import { useRef, useState } from "react"
import { toast } from "sonner"
import axiosClient from "../axios-client"
import * as Yup from "yup"

const AddCertificateModal = ({open, close, fetchCerts}) => {
    const [loading, setLoading] = useState();
    const [uploading, setUploading] = useState(false);
    const [dragover, setDragOver] = useState(false);
    const fileInputRef = useRef(null);


    const formik = useFormik({
        initialValues: {
            certificateName: '',
            certificateFile: null,
        },
        validationSchema: Yup.object({
            certificateName: Yup.string()
                .max(50, 'Certificate Name must be 50 characters or less')
                .required('Certificate Name is required'),
            certificateFile: Yup.mixed()
            .required('Please upload a certificate file')
            .test('fileType', 'Only images (JPG, PNG, GIF, WEBP) or PDFs are allowed', (value) => {
            if (!value) return false;
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'application/pdf',
            ];
            return allowedTypes.includes(value.type);
            })
            .test('fileSize', 'File size must not exceed 5MB', (value) => {
            if (!value) return false;
            return value.size <= 5 * 1024 * 1024; // 5MB
            }),
        }),
        onSubmit: (values) => {
            handleUploadCertificate();
        },
    });

    const handleUploadCertificate = () => {
        if(uploading) return;
        const {certificateName, certificateFile} = formik.values;
        setUploading(true);

        if(!certificateName || !certificateFile){
            toast.error("Please fill in all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("external_certificate", certificateFile);
        axiosClient.post(`/certificates/addexternal?external_certificate_name=${encodeURIComponent(certificateName)}`,
            formData, {
            headers: {'Content-Type': 'multipart/form-data' }
        }).then(({data})=>{
            toast.success("Certificate added successfully.");
            formik.resetForm();
            setUploading(false);
            fetchCerts();
            close();
        }).catch((error)=>{
            const message = error?.response?.data?.message || "An error occurred. Please try again.";
            toast.error(message);
        }).finally(()=>{
            setLoading(false);
        });
    }

    const validateFileType = (file) => {
        if (!file) return false;

        const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        ];

        if (!allowedTypes.includes(file.type)) {
        toast.error('Only image files (JPG, PNG, GIF, WEBP) or PDF documents are allowed.');
        return false;
        }

        if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must not exceed 5MB.');
        return false;
        }

        return true;
    };

     const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (validateFileType(file)) {
            formik.setFieldValue('certificateFile', file);
            formik.setTouched({ ...formik.touched, certificateFile: true });
        }
        e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file && validateFileType(file)) {
        formik.setFieldValue('certificateFile', file);
        formik.setTouched({ ...formik.touched, certificateFile: true });
        } else {
        e.target.value = '';
        formik.setFieldValue('certificateFile', null);
        formik.setTouched({ ...formik.touched, certificateFile: true });
        }
    };



    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                                                w-[100vw]
                                                                                md:w-[50vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                {/* Header */}
                                    <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                        <div>
                                            <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Add Certificate</h1>
                                            <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Add and save your external certificates</p>
                                        </div>
                                        <div className="">
                                            <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                            w-5 h-5 text-xs
                                                            md:w-8 md:h-8 md:text-base"
                                                onClick={()=>{
                                                    //setTimeout(()=>{formik.resetForm();setFormCompleted([])},1000)
                                                    formik.resetForm();
                                                    close()
                                                }}>
                                                <FontAwesomeIcon icon={faXmark}/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-2 px-4 py-2">
                                        <div className="inline-flex flex-col gap-1
                                                                    md:col-span-3">
                                            <label htmlFor="employeeID" className="font-text text-xs flex flex-row justify-between">
                                                <p>Certificate Name:<span className="text-red-500">*</span></p>
                                            </label>
                                            <input type="text" name="certificateName"
                                                    value={formik.values.certificateName}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    maxLength={50}
                                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            {formik.touched.certificateName && formik.errors.certificateName ? (<div className="text-red-500 text-xs font-text">{formik.errors.certificateName}</div>):null}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label htmlFor="employeeID" className="font-text text-xs flex flex-row justify-between">
                                                <p>Attachment:<span className="text-red-500">*</span></p>
                                            </label>
                                            {/* <div className={`h-36 border-2 border-dashed border-gray-700 bg-gray-200 rounded-md gap-2 flex flex-col items-center justify-center ${dragover || formik.values.certificateFile ? 'bg-primarybg border-primary' : ''}`}
                                                onDrop={handleDrop} onDragOver={(e)=>{e.preventDefault(); setDragOver(true)}} onDragLeave={()=>setDragOver(false)}>
                                                <FontAwesomeIcon icon={faImage} className={`text-4xl ${formik.values.certificateFile ? "text-primary" : "text-gray-500"} `}/>
                                                <p className={`font-text text-xs ${formik.values.certificateFile ? "text-primary":"text-unactive"}`}>{formik.values.certificateFile ? formik.values.certificateFile.name : "Please drop or upload your attachment here"}</p>
                                                <input ref={fileInputRef} type="file" name="certificateFile" accept="image/*,.pdf" onChange={(e)=>handleFileChange(e)}
                                                className="absolute opacity-0 cursor-pointer"
                                                />
                                            </div>
                                            {formik.touched.certificateFile && formik.errors.certificateFile ? (<div className="text-red-500 text-xs font-text">{formik.errors.certificateFile}</div>):null} */}

                                            <div
                                                className={`h-36 border-2 border-dashed border-gray-700 bg-gray-200 rounded-md gap-2 flex flex-col items-center justify-center relative ${
                                                    dragover || formik.values.certificateFile ? 'bg-primarybg border-primary' : ''
                                                }`}
                                                onDrop={handleDrop}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setDragOver(true);
                                                }}
                                                onDragLeave={() => setDragOver(false)}
                                                >
                                                <FontAwesomeIcon
                                                    icon={faImage}
                                                    className={`text-4xl ${
                                                    formik.values.certificateFile ? 'text-primary' : 'text-gray-500'
                                                    }`}
                                                />
                                                <p
                                                    className={`font-text text-xs ${
                                                    formik.values.certificateFile ? 'text-primary' : 'text-unactive'
                                                    }`}
                                                >
                                                    {formik.values.certificateFile
                                                    ? formik.values.certificateFile.name
                                                    : 'Please drop or upload your attachment here'}
                                                </p>

                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    name="certificateFile"
                                                    accept="image/*,.pdf"
                                                    onChange={handleFileChange}
                                                    className="absolute opacity-0 cursor-pointer w-full h-full"
                                                />
                                                </div>

                                            {formik.touched.certificateFile && formik.errors.certificateFile && (
                                                <div className="text-red-500 text-xs font-text">{formik.errors.certificateFile}</div>
                                            )}

                                        </div>
                                    </form>
                                    <div className="flex flex-row justify-between items-center px-4 gap-2 mt-2">
                                        <div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                            onClick={()=>{close()}}>
                                            <p className="font-header">Cancel</p>
                                        </div>
                                        <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md bg-primary text-white hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover transition-all ease-in-out `}
                                            onClick={()=>{loading ? null : handleUploadCertificate()}}>
                                            <p className="font-header">{uploading ? "Uploading..." : "Add Certificate"}</p>
                                        </div>
                                    </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>

        </Dialog>
    )
}
export default AddCertificateModal;
