import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

const DeletePanelModal = ({open, close, refresh, refreshPanel, id}) => {

    const [deleting, setDeleting] = useState()
    const [panelId, setPanelId] = useState(id)

    useEffect(() => {
        setPanelId(id)
    }, [id])

    //console.log("Panel ID:", panelId)

    const handleDelete = () => {
        setDeleting(true)
        axiosClient.delete(`carousels/${panelId}`)
        .then(()=>{
            refresh()
            close(),
            setTimeout(() => {
            setDeleting(false)}, 500)
        }
        ).catch((error) => {
            setDeleting(false)
            console.log("Error:", error)})
    }


    return(
        <>
            <Dialog open={open} onClose={()=>{}}>
                <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40" />
                    <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                        <div className='flex min-h-full items-center justify-center p-4 text center'>
                            <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[80vw]
                                                        md:w-[40vw]'>
                                <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                    {/* Header */}
                                    <div className="pb-4 border-divider flex flex-row justify-between item-center">
                                        <div>
                                            <p className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Delete Panel?</p>
                                            <p className="text-unactive font-text
                                                    text-xs
                                                    md:text-sm">Please confirm to delete the selected panel</p>
                                        </div>
                                    </div>
                                    {/* Action */}
                                    <div className="grid grid-cols-2 col-span-3 gap-2">
                                        <div className="font-header p-2 text-primary border-2 border-primary rounded-md flex items-center justify-center hover:cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out"
                                            onClick={close}>
                                            Cancel
                                        </div>
                                        <div className="font-header bg-primary text-white p-2 border-2 border-primary rounded-md flex items-center justify-center hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out"
                                            onClick={()=> handleDelete()}>
                                            {deleting ? "Deleting..." : "Delete"}
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
            </Dialog>
        </>
    )
}
export default DeletePanelModal
