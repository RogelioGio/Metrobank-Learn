import { faCircleXmark as regularXmark } from '@fortawesome/free-regular-svg-icons';
import { faListCheck, faTrash, faXmark, faCircleXmark as solidXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import axios from 'axios';
import { format } from 'date-fns';
import { useFormik, yupToFormErrors } from 'formik';
import axiosClient from 'MBLearn/src/axios-client';
import { useOption } from 'MBLearn/src/contexts/AddUserOptionProvider';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';

const DeleteFormInputModal = ({open, close, formInput, type, fetchOptions}) => {

    const [deleting, setDeleting] = useState(false)


    const handleDelete = () => {
        setDeleting(true)
        const endpoint = type === "division" ? `/division/${formInput.id}` : type === "department" ? `/department/${formInput.id}` : type === "posistion" ? `/title/${formInput.id}` : type === "cities" ? `/city/${formInput.id}` : type === "branch" ? `/branch/${formInput.id}` : null
        // axiosClient.delete(endpoint)
        // .then(({data})=>{
        //     console.log(data)
        //     setDeleting(false)
        //     fetchOptions();
        //     toast.success("Input Deleted")
        //     close()
        // })
        // .catch((err)=>{
        //     console.log(err)
        //     setDeleting(false)
        // })

        axiosClient.patch(`/restore-item/${formInput.id}`)
        .then(({data})=>{
            console.log(data)
            setDeleting(false)
            fetchOptions();
            toast.success("Input Restored")
            close()
        })
        .catch((err)=>{
            console.log(err)
            setDeleting(false)
        })
    }



    return (
        <>
            <Dialog open={open} onClose={close}>
                <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50 backdrop-blur-sm"/>
                <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[50vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                <div className='pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center'>
                                    {/* Header */}
                                    <div className=''>
                                        <h1 className='text-primary font-header
                                                        text-base
                                                        md:text-2xl'>Delete Input</h1>
                                        <p className='text-unactive font-text
                                                        text-xs
                                                        md:text-sm'>Confirm to delete input in the system can will be used in form and options</p>
                                    </div>
                                    <div>
                                        <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                    w-5 h-5 text-xs
                                                    md:w-8 md:h-8 md:text-base"
                                        onClick={close}>
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col mx-4 py-2'>
                                    <p className='text-unactive font-text text-xs'>Type:</p>
                                    <p className='text-primary font-text'>{type === "division" ? "Division" : type === "department" ? "Department" : type === "posistion" ? "Title" : type === "cities" ? "City" : type === "branch" ? "Branch" : null}</p>
                                </div>

                                <div className='flex flex-col mx-4 py-2'>
                                    <p className='text-unactive font-text text-xs'>Input Name:</p>
                                    <p className='text-primary font-text'>{formInput?.division_name || formInput?.department_name || formInput?.title_name || formInput?.city_name || formInput?.branch_name}</p>
                                </div>


                                <div className="mx-4 flex flex-row gap-2 pt-2">
                                <button onClick={close}
                                className={`bg-white border-2 border-primary p-4 rounded-md font-header uppercase text-primary text-xs hover:cursor-pointer hover:bg-primaryhover hover:text-white hover:border-primaryhover transition-all ease-in-out w-full`}>
                                    Cancel
                                </button>
                                    <div className={`bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out w-full flex flex-row justify-center items-center ${deleting ? "opacity-50 hover:cursor-not-allowed" : null}`}
                                    onClick={()=>{
                                        if(deleting) return
                                        handleDelete()
                                    }}>
                                        {
                                            deleting ?
                                            <p>Deleting...</p>
                                            : <p>Delete</p>
                                        }
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
export default DeleteFormInputModal;
