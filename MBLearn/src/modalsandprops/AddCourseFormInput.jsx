import { faCircleXmark as regularXmark } from '@fortawesome/free-regular-svg-icons';
import { faListCheck, faXmark, faCircleXmark as solidXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import axios from 'axios';
import { useFormik, yupToFormErrors } from 'formik';
import axiosClient from 'MBLearn/src/axios-client';
import { useOption } from 'MBLearn/src/contexts/AddUserOptionProvider';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { toast } from "sonner"


const AddCourseFormInput = ({open, close, fetch}) => {
    const [adding, setAdding] = useState(false)

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            category_name: "",
        },
        validationSchema: Yup.object({
            category_name: Yup.string().required("Input name is required").max(50, "Input name must be at most 50 characters"),
        }),
        onSubmit: (values) => ({

        })
    });

    const handleSubmit = () => {
        setAdding(true)
        axiosClient.post('/category/add', formik.values)
        .then(({data})=>{
            toast.success("Successfully added new course category")
            setAdding(false)
            fetch()
            close()
            formik.resetForm();
        })
        .catch((err)=>{
            const response = err.response;
            if(response && response.status === 422){
                toast.error("Unprocessable Entity. Please check your input.")
                console.log(response.data.errors);
            } else {
                toast.error("An error occurred. Please try again.")
            }
            setAdding(false)
        })
    }

    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50 backdrop-blur-sm"/>
            <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4 text center'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                                            w-[100vw]
                                                                            md:w-[50vw]'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            <div className='mx-4 border-b border-divider flex flex-row justify-between item-center'>
                                {/* Header */}
                                <div>
                                    <h1 className='text-primary font-header
                                                    text-base
                                                    md:text-2xl'>Add Form Input</h1>
                                    <p className='text-unactive font-text
                                                    text-xs
                                                    md:text-sm'>Add new input in the system can will be used in form and options</p>
                                </div>
                                <div>
                                    <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                w-5 h-5 text-xs
                                                md:w-8 md:h-8 md:text-base"
                                    onClick={()=>close()}>
                                        <FontAwesomeIcon icon={faXmark}/>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={formik.handleSubmit} className='px-4 py-2'>
                                <div className="inline-flex flex-col gap-1 col-span-1 pb-2 w-full">
                                    <label htmlFor="category_exam" className="font-text  text-xs flex flex-row justify-between">
                                        <p>Input Name <span className="text-red-500">*</span></p>
                                    </label>
                                    <input type="text" name="category_name"
                                            value={formik.values.category_name}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            maxLength={50}
                                            className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                    {formik.touched.category_name && formik.errors.category_name ? (<div className="text-red-500 text-xs font-text">{formik.errors.category_name}</div>):null}
                                </div>
                            </form>
                            <div className='mx-4 flex flex-row gap-1'>
                                <div className='flex items-center justify-center bg-white border-2 border-primary p-4 rounded-md font-header uppercase text-primary text-xs hover:cursor-pointer hover:bg-primaryhover hover:text-white hover:border-primaryhover transition-all ease-in-out w-full'
                                    onClick={()=>{
                                        onClose()
                                        setTimeout(()=>{formik.resetForm()},500)
                                    }}>
                                    Cancel
                                </div>
                                <div className={`${adding ? "opacity-50 hover:cursor-not-allowed":"hover:cursor-pointer"} flex items-center justify-center bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:bg-primaryhover transition-all ease-in-out w-full`}
                                    onClick={()=>{if(adding) return
                                                    handleSubmit()
                                                }}>
                                    {adding ? "Adding...":"Add Form Input"}
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default AddCourseFormInput;
