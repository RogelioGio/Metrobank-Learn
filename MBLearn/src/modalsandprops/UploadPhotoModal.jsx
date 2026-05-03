import { faBullhorn, faFileArrowDown, faFileArrowUp, faSpinner, faUpload, faX, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import * as React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axiosClient, { uploadPhoto } from "../axios-client";
import { CarouselContentProvider, useCarouselContext } from "../contexts/CarourselContext";
import { toast } from "sonner";

const UploadPhotoModal = ({open, close, refreshlist, refreshpanel}) => {

    const [filename, setFilename] = useState("");
    const [fileUploaded, setFileUploaded] = useState();
    const [uploading, setUploading] = useState()
    const [wrongFile, setWrongFile] = useState()
    const [photo, setPhoto] = useState();
    const [dragging , setDragging] = useState(false);

    const handlePictureUpload = (e) => {
        const file = e.target.files[0];
        ImageProccessing(file)
    }

    const ImageProccessing = (img) => {
        if(!img) return

        // const fileType = img.name.split('.').pop().toLowerCase();
        // const allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        // if (!allowedImageTypes.includes(fileType)) {
        //     setWrongFile(true)
        // }

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowedImageTypes.includes(img.type)) {
            setWrongFile(true);
            setFileUploaded(false);
            setPhoto(null);
            setFilename(null);
            toast.error('Only image files (JPG, PNG, GIF, WEBP) are allowed.');
            return; // 🚫 Stop here if invalid
        }

        setWrongFile(false)
        setFileUploaded(true)
        setFilename(img.name);
        setPhoto(img);
    }


    const uploadHandler = () => {
        if(uploading) return
        const image = new FormData();
        image.append("image", photo);
        //image.append("upload_preset", "mblearn_preset");
        image.append("image_name", filename);
        setUploading(true)
        axiosClient.post('/carousels', image, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            setUploading(false)
            refreshlist()
            Close();
        }).catch((error) => {
            console.log("Error", error);
            setUploading(false)
        })

        // uploadPhoto.post("/upload", image)
        // .then((res)=>{
        //     console.log("Response", res);
        //     setUploading(false)
        //     refreshlist()
        //     refreshpanel()
        //     Close();
        // })
        // .catch((err)=>{
        //     console.log("Error", err);
        //     setUploading(false)
        //     setWrongFile(true)
        // })
    }

    const Close = () => {
        setTimeout(()=>{
            setFileUploaded()
            setFilename()
            setPhoto()
            setWrongFile(false)
        },1000)
        close()
    }

    return(
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40" />
                <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[80vw]
                                                        md:w-[40vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                 {/* Header */}
                                <div className="pb-4 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                    <div>
                                        <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Upload</h1>
                                        <p className="text-unactive font-text
                                                    text-xs
                                                    md:text-sm">Upload a file or photo in the system</p>
                                    </div>
                                    <div className="">
                                        <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                    w-5 h-5 text-xs
                                                    md:w-8 md:h-8 md:text-base"
                                            onClick={Close}>
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="py-2 pt-4 mx-4">
                                    {
                                        !fileUploaded ? (
                                            <>
                                            {/* <label htmlFor="import" className="w-full py-10 border-2 border-dashed border-unactive rounded-md flex flex-row items-center justify-center text-sm font-text gap-2 text-unactive hover:cursor-pointer">
                                                <FontAwesomeIcon icon={faFileArrowUp} className="text-2xl"/>
                                                <p>Drag or upload you panel here</p>
                                                <input type="file" accept="image/*" className="hidden" id="import" onChange={handlePictureUpload}/>
                                                </label> */}
                                                <label htmlFor="import" className="">
                                                    <div
                                                    onDrop={(e) => {e.preventDefault(); e.stopPropagation();
                                                        const file = e.dataTransfer.files[0];
                                                        setDragging(false);
                                                        ImageProccessing(file);
                                                    }}
                                                    onDragOver={(e)=>{e.preventDefault(); e.stopPropagation();
                                                        setDragging(true);
                                                    }}
                                                    onDragEnter={(e)=>{e.preventDefault(); e.stopPropagation();
                                                        setDragging(true);
                                                    }}
                                                    onDragLeave={(e)=>{e.preventDefault(); e.stopPropagation();
                                                        setDragging(false);
                                                    }} className={`w-full py-10 border-2 rounded-md flex flex-row items-center justify-center text-sm font-text gap-2 hover:cursor-pointer transition-all ease-in-out border-dashed ${dragging ? "border-primary bg-primarybg text-primary":"text-unactive border-unactive"}`}>

                                                    <FontAwesomeIcon icon={dragging ? faFileArrowDown : faFileArrowUp} className="text-2xl"/>
                                                    <input type="file" accept="image/*" className="hidden" id="import" onChange={handlePictureUpload}/>
                                                    {
                                                        dragging ? "Drop Here" : "Drag or upload your panel here"
                                                    }
                                                    </div>
                                                </label>

                                            {
                                                wrongFile ?
                                                <div className="py-2 flex items-center justify-center font-text text-sm text-red-700">
                                                    <p>Please only upload image file for the announcement panel</p>
                                                </div> : null
                                            }
                                            </>
                                        ) : (
                                            <div className="font-text flex flex-col gap-2 md:flex-row md:justify-between">
                                                <div>
                                                    <p className="text-xs text-unactive">File Uploaded:</p>
                                                    <p className="text-sm text-primary">{filename}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-unactive">File Type:</p>
                                                    <p className="text-sm text-primary">{photo.name.split('.').pop().toUpperCase()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-unactive">File Size:</p>
                                                    <p className="text-sm text-primary">{(photo.size / 1024).toFixed(2)} KB</p>
                                                </div>
                                            </div>
                                        )
                                    }
                                    {/* Drag Import */}
                                </div>
                                {
                                    fileUploaded ?
                                    <div className="py-2 mx-4 grid grid-cols-2 gap-x-2">
                                        {/* Action Button */}
                                        <button type="button" className="w-full inline-flex flex-col items-center gap-2 p-3 rounded-md font-header uppercase text-primary border-2 border-primary text-xs hover:text-white hover:cursor-pointer hover:bg-primaryhover hover:scale-105 transition-all ease-in-out"
                                            onClick={Close}
                                            >
                                            <p>Cancel</p>
                                        </button>
                                        <button type="submit" className={`w-full inline-flex flex-col items-center justify-center gap-2 bg-primary p-3 rounded-md font-header uppercase text-white text-xs transition-all ease-in-out ${uploading ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer hover:bg-primaryhover hover:scale-105"}`}
                                            onClick={uploadHandler}
                                            disabled={uploading}>
                                            <p>{uploading ? <>

                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white"/>
                                                <span className="ml-2">Uploading...</span>

                                                </> : "Upload"}</p>
                                        </button>
                                    </div>
                                    :
                                    null
                                }

                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>
    )
}
export default UploadPhotoModal
