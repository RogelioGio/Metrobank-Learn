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

const AddFormInputModal = ({ isOpen, onClose, formInput, category, fetchOptions}) => {
    const [adding, setAdding] = useState(false)
    const {cities, location, divisions, career_level} = useOption();

    const formik = useFormik({
        initialValues: {
            type: '',
            division: '',
            department: '',
            title: '',
            section: '',
            city: '',
            branch: '',
            career_level: '',
            name: ''
        },
    })

    const dept = (divs) => {
        const selectedDivision = divisions?.find((d) => d.id == divs);

        if (selectedDivision && !selectedDivision.departments.some((d) => d.id === Number(formik.values.department)))
        {
            formik.setFieldValue("department", selectedDivision.departments[0]?.id ?? "");
        }

        return selectedDivision?.departments ?? [];
    }

    const handleSubmit = () => {
        const payload =
        formik.values.type === "division" ?
        {
            "division_name": formik.values.name
        } : formik.values.type === "department" ?
        {
            "department_name": formik.values.name,
            "division_id": Number(formik.values.division)
        } : formik.values.type === "title" ?
        {
            "title_name": formik.values.name,
            "department_id": Number(formik.values.department),
            "career_level_id": Number(formik.values.career_level)
        } : formik.values.type === "city" ?
        {
            "city_name": formik.values.name
        } : formik.values.type === "branch" ?
        {
            "branch_name": formik.values.name,
            "city_id": Number(formik.values.city)
        } : {};

        setAdding(true)
        axiosClient.post(`/${formik.values.type}/add`, payload)
        .then(({data}) => {
            toast.success(`${formik.values.type.charAt(0).toUpperCase() + formik.values.type.slice(1)} added successfully`)
            setAdding(false)
            onClose();
            setTimeout(()=>{formik.resetForm()},500)
            fetchOptions();
        })
        .catch((error) => {
            const response = error.response;
            if (response && response.status === 422) {
                toast.error(response.data.message)
                Object.keys(response.data.errors).forEach((key) => {
                    const message = response.data.errors[key][0];
                    toast.error(message);
                });
            } else {
                toast.error("An error occurred. Please try again.");
            }
            onClose();
            setTimeout(()=>{formik.resetForm()},500)
            setAdding(false)
        });
    }

    const item = () => {
        {
                                    formInput === 'Division' ? (
                                        <div className='px-4 py-2'>
                                            <form onSubmit={formik.handleSubmit}>
                                            <div className='row-start-2 py-2'>
                                                <label htmlFor={formInput} className="font-header text-xs flex flex-row justify-between pb-2">
                                                <p className="font-text">{formInput} Input Name:</p>
                                                </label>
                                                <input type="input" name={formInput}
                                                    value={formik.values[formInput]}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className="w-full font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                    {/* Validation Errors */}
                                                    {formik.touched[formInput] && formik.errors[formInput] && <div className='pt-2 text-xs text-red-500 font-text'>{formik.errors[formInput]}</div>}
                                                </div>
                                            </form>
                                        </div>
                                    ) : formInput === 'Department' ? (
                                        <div className='px-4 py-2'>
                                            <form onSubmit={formik.handleSubmit}>
                                            <div className='row-start-2 py-2'>
                                                <label htmlFor="input" className="font-header text-xs flex flex-row justify-between pb-2">
                                                <p className="font-text">{formInput} Input Name:</p>
                                                </label>
                                                <input type="input" name={formInput}
                                                    value={formik.values[formInput]}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    maxLength={50}
                                                    className="w-full font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                    {/* Validation Errors */}
                                                    {formik.touched[formInput] && formik.errors[formInput] && <div className='pt-2 text-xs text-red-500 font-text'>{formik.errors[formInput]}</div>}
                                                </div>
                                            </form>
                                        </div>
                                    ) : formInput === 'Title' ? (
                                        <div className='px-4 py-2'>
                                            <form onSubmit={formik.handleSubmit}>
                                                <div className='row-start-2 py-2'>
                                                <label htmlFor="input" className="font-header text-xs flex flex-row justify-between pb-2">
                                                <p className="font-text">{formInput} Input Name:</p>
                                                </label>
                                                <input type="input" name={formInput}
                                                    value={formik.values[formInput]}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    maxLength={50}
                                                    className="w-full font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                    {/* Validation Errors */}
                                                    {formik.touched[formInput] && formik.errors[formInput] && <div className='pt-2 text-xs text-red-500 font-text'>{formik.errors[formInput]}</div>}
                                            </div>
                                            </form>
                                        </div>
                                    ) : formInput === 'Section' ? (
                                        <div className='px-4 py-2'>
                                            <form onSubmit={formik.handleSubmit}>
                                            <div className='row-start-2 py-2'>
                                                <label htmlFor="input" className="font-header text-xs flex flex-row justify-between pb-2">
                                                <p className="font-text">{formInput} Input Name:</p>
                                                </label>
                                                <input type="input" name={formInput}
                                                    value={formik.values[formInput]}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className="w-full font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                    {/* Validation Errors */}
                                                    {formik.touched[formInput] && formik.errors[formInput] && <div className='pt-2 text-xs text-red-500 font-text'>{formik.errors[formInput]}</div>}
                                                </div>
                                            </form>
                                            </div>
                                    ) : formInput === 'City' ? (
                                        <div className='px-4 py-2'>
                                            <form onSubmit={formik.handleSubmit}>
                                            <div className='row-start-2 py-2'>
                                                <label htmlFor="input" className="font-header text-xs flex flex-row justify-between pb-2">
                                                <p className="font-text">{formInput} Input Name:</p>
                                                </label>
                                                <input type="input" name={formInput}
                                                    value={formik.values[formInput]}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className="w-full font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                    {/* Validation Errors */}
                                                    {formik.touched[formInput] && formik.errors[formInput] && <div className='pt-2 text-xs text-red-500 font-text'>{formik.errors[formInput]}</div>}
                                                </div>
                                            </form>
                                            </div>
                                    ) : formInput === 'Branch' ? (
                                        <div className='px-4 py-2'>
                                            <form onSubmit={formik.handleSubmit}>
                                            {/* City Selector */}
                                            <div>
                                                <label htmlFor="input" className="font-header text-xs flex flex-row justify-between pb-2">
                                                <p className="font-text">City:</p>
                                                </label>
                                                <div className="grid grid-cols-1">
                                                    <select id="role" name="city" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md py-2 px-4 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                        value={formik.values.city}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        >
                                                        <option value=''>
                                                            <p className='text-unactive'>Select City</p>
                                                        </option>
                                                        {
                                                            cities.map((city) => (
                                                                <option key={city.id} value={city.id}>{city.city_name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>
                                                {formik.touched.city && formik.errors.city && <div className='text-xs text-red-500 font-text py-2'>{formik.errors.city}</div>}
                                            </div>

                                            <div className='py-2'>
                                                <label htmlFor="input" className="font-header text-xs flex flex-row justify-between pb-2">
                                                <p className="font-text">{formInput} Input Name:</p>
                                                </label>
                                                <input type="input" name={formInput}
                                                    value={formik.values[formInput]}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className="w-full font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                    {/* Validation Errors */}
                                                    {formik.touched[formInput] && formik.errors[formInput] && <div className='pt-2 text-xs text-red-500 font-text'>{formik.errors[formInput]}</div>}
                                                </div>
                                            </form>
                                        </div>
                                    ): (null)
                                }
    }

    return (
        <>
        <Dialog open={isOpen} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50 backdrop-blur-sm"/>
                <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        md:w-[50vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                <div className='pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center'>
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
                                        onClick={onClose}>
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </div>
                                    </div>
                                </div>
                                <form onSubmit={formik.handleSubmit} className='flex flex-col justify-between h-full py-2 px-4'>
                                    <div className="inline-flex flex-col gap-1 col-span-1 py-2">
                                        <label htmlFor="type" className="font-text text-xs flex">Input Type <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-1">
                                            <select id="division" name="type" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                value={formik.values.type}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}>
                                                    <option value="">Input Type</option>
                                                    <option value="division">Division</option>
                                                    <option value="department">Department</option>
                                                    <option value="title">Title</option>
                                                    <option value="city">City</option>
                                                    <option value="branch">Branch</option>
                                            </select>
                                            <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                        {/* {formik.touched.division && formik.errors.division ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.division}</p></div>):null} */}
                                    </div>
                                    <div className='flex flex-row gap-2'>
                                        {
                                            formik.values.type === "department" || formik.values.type === "title" ?
                                            <div className="w-full inline-flex flex-col gap-1 col-span-1 py-2">
                                                <label htmlFor="division" className="font-text text-xs flex">Division <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-1">
                                                    <select id="division" name="division" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                        value={formik.values.division}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}>
                                                            <option value="">Select Division</option>
                                                            {
                                                                divisions.map((division) => (
                                                                    <option key={division.id} value={division.id}>{division.division_name}</option>
                                                                ))
                                                            }
                                                    </select>
                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>
                                                {/* {formik.touched.division && formik.errors.division ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.division}</p></div>):null} */}
                                            </div> : null
                                        }
                                        {
                                            formik.values.type === "title" ?
                                            <div className="w-full inline-flex flex-col gap-1 col-span-1 py-2">
                                                <label htmlFor="department" className="font-text text-xs flex">Department <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-1">
                                                    <select id="division" name="department" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                        value={formik.values.department}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}>
                                                            <option value="">Select Department</option>
                                                            {
                                                                dept(formik.values.division).map((department) => (
                                                                    <option key={department.id} value={department.id}>{department.department_name}</option>
                                                                ))
                                                            }
                                                    </select>
                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>
                                                {/* {formik.touched.division && formik.errors.division ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.division}</p></div>):null} */}
                                            </div> : null
                                        }
                                        {
                                            formik.values.type === "branch" ?
                                            <div className="w-full inline-flex flex-col gap-1 col-span-1 py-2">
                                                <label htmlFor="city" className="font-text text-xs flex">City <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-1">
                                                    <select id="division" name="city" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                        value={formik.values.city}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}>
                                                            <option value="">Select City</option>
                                                            {
                                                                cities.map((division) => (
                                                                    <option key={division.id} value={division.id}>{division.city_name}</option>
                                                                ))
                                                            }
                                                    </select>
                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>
                                                {/* {formik.touched.division && formik.errors.division ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.division}</p></div>):null} */}
                                            </div> : null
                                        }
                                    </div>
                                    <div className='flex flex-row gap-2'>
                                        {
                                            formik.values.type === "title" ?
                                            <div className="w-full inline-flex flex-col gap-1 col-span-1 py-2">
                                                <label htmlFor="career_level" className="font-text text-xs flex">Career Level <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-1">
                                                    <select id="division" name="career_level" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                        value={formik.values.career_level}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}>
                                                            <option value="">Select Career Level</option>
                                                            {
                                                                career_level.map((career) => (
                                                                    <option key={career.id} value={career.id}>{career.name}</option>
                                                                ))
                                                            }
                                                    </select>
                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>
                                                {/* {formik.touched.division && formik.errors.division ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.division}</p></div>):null} */}
                                            </div> : null
                                        }
                                    </div>
                                    <div>
                                        <div className="inline-flex flex-col gap-1 col-span-1 pb-2 w-full">
                                            <label htmlFor="name" className="font-text  text-xs flex flex-row justify-between">
                                                <p>Input Name <span className="text-red-500">*</span></p>
                                            </label>
                                            <input type="text" name="name"
                                                    value={formik.values.name}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    maxLength={50}
                                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            {formik.touched.name && formik.errors.name ? (<div className="text-red-500 text-xs font-text">{formik.errors.name}</div>):null}
                                            </div>
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
                                        onClick={()=>{
                                                        if(adding) return
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
        </>
    )
}
export default AddFormInputModal;
