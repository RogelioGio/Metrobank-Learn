import { faAdd, faBullhorn, faChevronLeft, faChevronRight, faClock, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import * as React from "react";
import UploadPhotoModal from "./UploadPhotoModal";
import { useState } from "react";
import { useEffect } from "react";
import axiosClient from "../axios-client";
import { format } from "date-fns";
import DeletePanelModal from "./DeletePanelModal";



//Front end Pagination
const usePagination = (data, itemPerpage = 2) => {
    const [currentPage, setCurrentPage] = useState(1);

    const indexFirstItem = (currentPage - 1) * itemPerpage;
    const indexLastItem = Math.min(indexFirstItem + itemPerpage, data?.length);
    const currentPaginated = data?.slice(indexFirstItem, indexLastItem)
    const totalPage = Math.ceil(data?.length / itemPerpage)
    const totalitem = data?.length

    //Pagination Controll
    const goto = (pageNum) => {
        if (pageNum >= 1 && pageNum <= totalPage) setCurrentPage(pageNum);
    }
    const next = () => {
        // setCurrentPage((prev) => Math.min(prev + 1, totalPage));
        if (currentPage < totalPage) setCurrentPage(currentPage + 1)
    };

    const back = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return {
        currentPaginated,
        currentPage,
        totalPage,
        indexFirstItem,
        indexLastItem,
        totalitem,
        goto,
        next,
        back
    }
}

const PhotoforCarouselModal = ({open, close, refresh}) => {
    const [openUpload, setOpenUpload] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [panels, setPanels] = useState()
    const [destroy, setDestroy] = useState(false)
    const [deletingID, setDeletingID] = useState()

    const {currentPaginated,
        currentPage,
        totalPage,
        indexFirstItem,
        indexLastItem,
        totalitem,
        goto,
        next,
        back} = usePagination(panels,5)

    useEffect(() => {
        if(!open) return
        fetchPanels()
    },[])

    const fetchPanels = () => {
        setIsLoading(true)
        axiosClient.get('/carousels')
        .then(({data}) => {
            setPanels(data)
            setIsLoading(false)
            console.log(data)
        }).catch((err)=> {
            setIsLoading(false)
        })
    }

    const openDelete = (id) => {
        setDestroy(true)
        setDeletingID(id)
    }

    const closeDelete = () => {
        setDestroy(false)
    }



    return(
        <>
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40" />
                <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40'>
                            <div className='bg-white rounded-md h-full p-5 grid grid-row-4 grid-cols-3 w-[75vw]'>
                                {/* Header */}
                                <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-row gap-4 col-span-3 justify-between">
                                    <div>
                                        <h1 className="text-primary font-header text-3xl">Customize Announcment Panels</h1>
                                        <p className="text-unactive font-text text-xs">Upload and manage announcement panel to be used in the system</p>
                                    </div>
                                    <div className="flex items-start justify-start">
                                        <div className="flex items-center justify-center w-8 aspect-square border-2 border-primary rounded-full text-primary hover:text-white hover:bg-primary hover:cursor-pointer transition-all ease-in-out" onClick={close}>
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </div>
                                    </div>
                                </div>
                                {/* Set Order */}
                                <div className="py-3 pr-4 col-start-3">
                                    <div className="flex flex-row justify-center items-center bg-white p-2 border-2 border-primary rounded-md shadow-md font-header text-primary gap-2 hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                        onClick={() => setOpenUpload(true)}>
                                        <FontAwesomeIcon icon={faAdd}/>
                                        <p> Add Panel </p>
                                    </div>
                                </div>
                                {/* Table for Announcement Panel */}
                                <div className="row-start-3 col-span-3 row-span-2 grid grid-cols-1 gap-4 px-4 pb-4">
                                    <div className="w-full border-primary border rounded-md overflow-hidden shadow-md">
                                        <table className='text-left w-full overflow-y-scroll'>
                                            <thead className='font-header text-xs text-primary bg-secondaryprimary'>
                                                <tr>
                                                    <th className='py-4 px-4 uppercase'>Panel Name</th>
                                                    <th className='py-4 px-4 uppercase'>Date-added</th>
                                                    <th className='py-4 px-4 uppercase'></th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-white divide-y divide-divider'>
                                                {
                                                    isLoading ? (
                                                        <tr>
                                                            <td colSpan={3}>
                                                                <div className="flex flex-col justify-center items-center py-4">
                                                                    <p className="text-primary font-text">Loading...</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        currentPaginated?.map((panel, index) => (
                                                            <tr key={panel.id} className={`font-text text-md text-unactive hover:bg-gray-200 cursor-pointer`}>
                                                                <td className={`font-text text-xs px-4  py-2 flex flex-row items-center gap-4 border-l-2 border-transparent transition-all ease-in-out`}>{panel.image_name}</td>
                                                                <td className={`font-text text-xs px-4 py-2 gap-4 transition-all ease-in-out`}>{format(new Date(panel.created_at), "MMMM dd, yyyy")}</td>
                                                                <td className="flex flex-row gap-2 justify-end px-4 py-2">
                                                                    <div className='aspect-square w-10 flex flex-row justify-center items-center bg-white border-2 border-primary rounded-md shadow-md text-primary hover:text-white hover:cursor-pointer hover:scale-105 hover:bg-primary ease-in-out transition-all'
                                                                        onClick={()=> openDelete(panel.id)}>
                                                                        <FontAwesomeIcon icon={faTrash} className='text-sm'/>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                        <div className="flex flex-row justify-between items-center">
                                        <div>
                                            <p className='text-sm font-text text-unactive'>
                                                Showing <span className='font-header text-primary'>{indexFirstItem + 1}</span> to <span className='font-header text-primary'>{indexLastItem}</span> of <span className='font-header text-primary'>{totalitem}</span> <span className='text-primary'>results</span>
                                            </p>
                                        </div>

                                        <div>
                                        <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                            {/* Previous */}
                                            <a
                                                onClick={back}
                                                className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronLeft}/>
                                            </a>

                                            {/* Current Page & Dynamic Paging */}
                                            {
                                                Array.from({ length: totalPage }, (_, i) => (
                                                    <a
                                                        key={i}
                                                        className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                            ${
                                                                currentPage === i + 1
                                                                ? 'bg-primary text-white'
                                                                : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                            } transition-all ease-in-out`}
                                                        onClick={() => goto(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </a>))
                                            }
                                            {/*
                                            */}
                                            <a
                                                onClick={next}
                                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                <FontAwesomeIcon icon={faChevronRight}/>
                                            </a>
                                        </nav>

                                        </div>
                                    </div>

                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>
        <UploadPhotoModal open={openUpload} close={() => setOpenUpload(false)} refreshlist={fetchPanels} refreshpanel={refresh}/>
        <DeletePanelModal open={destroy} close={closeDelete} referesh={fetchPanels} refereshPanel={refresh} id={deletingID}/>
        </>
    )
}
export default PhotoforCarouselModal;
