import { faListCheck, faXmark, faCircleXmark as solidXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import axios from 'axios';
import { useFormik, yupToFormErrors } from 'formik';
import axiosClient from 'MBLearn/src/axios-client';
import { useOption } from 'MBLearn/src/contexts/AddUserOptionProvider';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';

const EditFormInputModal = ({open, close, formInput, formInputEntry = {}, fetchOptions}) => {
    const [editing, setEditing] = useState(false);
    const {cities, location, divisions, career_level} = useOption();

    // const formik = useFormik({
    //     enableReinitialize: true,
    //     initialValues:
    //     formInput === 'Branch' ? {
    //         city: formInputEntry?.[Object.keys(formInputEntry).find(key => key.endsWith('_id'))],
    //         [formInput]: formInputEntry?.[Object.keys(formInputEntry).find(key => key.endsWith('_name'))]
    //     }:{
    //         [formInput]: formInputEntry?.[Object.keys(formInputEntry).find(key => key.endsWith('_name'))]
    //     },
    //     validationSchema: Yup.object({
    //         [formInput]: Yup.string().required('This field is required').max(100, "too many characters").matches(/^[a-zA-Z\s]*$/, 'No special characters allowed')

    //     }),
    //     onSubmit: (value) => {
    //         console.log(value[formInput])

    //         setEditing(true)
    //         function getEndPoint(formInput) {
    //             switch (formInput) {
    //                 case 'Division' :
    //                     return 'divisions';
    //                 case 'Department' :
    //                     return 'departments';
    //                 case 'Section' :
    //                     return 'sections'
    //                 case 'City' :
    //                     return 'cities'
    //                 default:
    //                     return null
    //             }
    //         }

    //         const endPoint = getEndPoint(formInput)
    //         // axiosClient.post(`/${endPoint}`, value[formInput])
    //         // .then((res) =>
    //         //     {
    //         //         console.log(res)
    //         //         //setAdding(false)
    //         //     })
    //         // .catch((err) => {
    //         //     //setAdding(false)
    //         // })
    //         setTimeout(()=>{
    //             setEditing(false)
    //             close()
    //         },2000)
    //     }
    // })

    const dept = (divs) => {
        const selectedDivision = divisions?.find((d) => d.id == divs);

        // if (selectedDivision && !selectedDivision.departments.some((d) => d.id === Number(formik.values.department_id)))
        // {
        //     formik.setFieldValue("department_id", selectedDivision.departments[0]?.id ?? "");
        // }

        return selectedDivision?.departments ?? [];
    }

    // useEffect(() => {
    //     console.log(formInputEntry)
    // },[formInputEntry])

    const getValidationSchema = (formInput) => {
        switch (formInput) {
        case "division":
            return Yup.object({
            division_name: Yup.string()
                .required("Division name is required")
                .max(100, "Too many characters")
                .matches(/^[a-zA-Z\s&'-]+$/, "No special characters allowed"),
            });

        case "department":
            return Yup.object({
            division_id: Yup.number()
                .required("Division is required")
                .notOneOf([0], "Please select a division"),
            department_name: Yup.string()
                .required("Department name is required")
                .max(100, "Too many characters")
                .matches(/^[a-zA-Z\s&'-]+$/, "No special characters allowed"),
            });

        case "title":
            return Yup.object({
            division_id: Yup.number()
                .required("Division is required")
                .notOneOf([0], "Please select a division"),
            department_id: Yup.number()
                .required("Department is required")
                .notOneOf([0], "Please select a department"),
            title_name: Yup.string()
                .required("Title name is required")
                .max(100, "Too many characters")
                .matches(/^[a-zA-Z\s&'-]+$/, "No special characters allowed"),
            });

        case "city":
            return Yup.object({
            city_name: Yup.string()
                .required("City name is required")
                .max(100, "Too many characters")
                .matches(/^[a-zA-Z\s&'-]+$/, "No special characters allowed"),
            });

        case "branch":
            return Yup.object({
            city_id: Yup.number()
                .required("City is required")
                .notOneOf([0], "Please select a city"),
            branch_name: Yup.string()
                .required("Branch name is required")
                .max(100, "Too many characters")
                .matches(/^[a-zA-Z\s&'-]+$/, "No special characters allowed"),
            });

        default:
            return Yup.object({});
        }
        };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            division_name: formInputEntry?.division_name ?? '',
            division_id: formInputEntry?.division_id ?? 0,
            department_name: formInputEntry?.department_name ?? '',
            department_id: formInputEntry?.department_id ?? 0,
            title_name: formInputEntry?.title_name ?? '',
            city_name: formInputEntry?.city_name ?? '',
            city_id: formInputEntry?.city_id ?? '',
            branch_name: formInputEntry?.branch_name ?? '',
        },
        validationSchema: getValidationSchema(formInput?.toLowerCase()),
        onSubmit: (values) => {
            handleEdit();
        }

    })

        const handleEdit = () => {
        if(editing) return;
        setEditing(true)
        const getEndPoint = () => {
            switch (formInput) {
                case 'division' :
                    return 'divisions';
                case 'department' :
                    return 'departments';
                case 'title' :
                    return 'titles';
                case 'city' :
                    return 'cities';
                case 'branch' :
                    return 'branches';
                default:
                    return null
            }
        }

        const payload = {
            ...formik.values,
            division_id: Number(formik.values.division_id),
            department_id: Number(formik.values.department_id),
            city_id: Number(formik.values.city_id),
            branch_id: Number(formik.values.branch_id),
        };
        axiosClient.put(`/${getEndPoint()}/${formInputEntry.id}`, payload)
        .then((res) => {
            console.log(res)
            toast.success(`${formInput} updated successfully`)
            setEditing(false)
            fetchOptions()
            close()
        }).catch((err) => {
            console.log(err)
            toast.error(`Failed to update ${formInput}`)
            setEditing(false)
        })

    }

    function getFieldKey(formInput) {
        switch (formInput) {
            case "division":
            return "division_name";
            case "department":
            return "department_name";
            case "title":
            return "title_name";
            case "city":
            return "city_name";
            case "branch":
            return "branch_name";
            default:
            return "name";
        }
    }

    const key = getFieldKey(formInput);

    const items = () => {
        return (
            <>
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
                                                    maxLength={11}
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
                                                    maxLength={11}
                                                    className="w-full font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                                    {/* Validation Errors */}
                                                    {formik.touched[formInput] && formik.errors[formInput] && <div className='pt-2 text-xs text-red-500 font-text'>{formik.errors[formInput]}</div>}
                                                </div>
                                            </form>
                                            </div>
                                    ) : formInput === 'Branch' ? (
                                        <div className='px-4 py-2'>
                                            {/* City Selector */}
                                            <form onSubmit={formik.handleSubmit}>
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
                                    ): (null)
                                }

            </>
        )
    }

    return(
        <>
            <Dialog open={open} onClose={()=>{}}>
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
                                                        md:text-2xl'>Edit {formInput} Input</h1>
                                        <p className='text-unactive font-text
                                                        text-xs
                                                        md:text-sm'>Edit {formInput?.toLowerCase()} input in the system can will be used in form and options</p>
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
                                {/* Content based on the clicked */}
                                <form onSubmit={formik.handleSubmit} className="px-4 py-2">
                                    {
                                        formInput === "department" || formInput === "title" ?
                                        <div className="w-full inline-flex flex-col gap-1 col-span-1 py-2">
                                            <label htmlFor="division" className="font-text text-xs flex">Division <span className="text-red-500">*</span></label>
                                            <div className="grid grid-cols-1">
                                                <select id="division_id" name="division_id" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                    value={formik.values.division_id}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}>
                                                        <option value={0}>Select Division</option>
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
                                            {formik.touched.division_id && formik.errors.division_id ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.division_id}</p></div>):null}
                                        </div> : null
                                    }
                                    {
                                        formInput === "title" ?
                                        <div className="w-full inline-flex flex-col gap-1 col-span-1 py-2">
                                            <label htmlFor="department" className="font-text text-xs flex">Department <span className="text-red-500">*</span></label>
                                            <div className="grid grid-cols-1">
                                                <select id="division" name="department_id" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                    value={formik.values.department_id}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}>
                                                        <option value={0}>Select Department</option>
                                                        {
                                                            dept(formik.values.division_id).map((department) => (
                                                                <option key={department.id} value={department.id}>{department.department_name}</option>
                                                            ))
                                                        }
                                                </select>
                                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                </svg>
                                            </div>
                                            {formik.touched.department_id && formik.errors.department_id ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.department_id}</p></div>):null}
                                        </div> : null
                                    }
                                    {
                                        formInput === "branch" ?
                                        <div className="w-full inline-flex flex-col gap-1 col-span-1 py-2">
                                            <label htmlFor="city" className="font-text text-xs flex">City <span className="text-red-500">*</span></label>
                                            <div className="grid grid-cols-1">
                                                <select id="division" name="city_id" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                    value={formik.values.city_id}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}>
                                                        <option value="">Select City</option>
                                                        {
                                                            cities.map((division) => (
                                                                <option key={Number(division.id)} value={division.id}>{division.city_name}</option>
                                                            ))
                                                        }
                                                </select>
                                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                </svg>
                                            </div>
                                            {formik.touched.city_id && formik.errors.city_id ? (<div className="text-red-500 text-xs font-text flex flex-row justify-end"><p>{formik.errors.city_id}</p></div>):null}
                                        </div> : null
                                    }
                                    <div>
                                        <div className="inline-flex flex-col gap-1 col-span-1 pb-2 w-full">
                                            <label htmlFor="name" className="font-text  text-xs flex flex-row justify-between">
                                                <p>Input Name <span className="text-red-500">*</span></p>
                                            </label>
                                            <input type="text" name={key}
                                                    value={formik.values[key]}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    maxLength={50}
                                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            {formik.touched[key] && formik.errors[key] ? (<div className="text-red-500 text-xs font-text">{formik.errors[key]}</div>):null}
                                            </div>
                                    </div>
                                </form>
                                <div className='mx-4 flex flex-row gap-1'>
                                    <div className='flex items-center justify-center bg-white border-2 border-primary p-4 rounded-md font-header uppercase text-primary text-xs hover:cursor-pointer hover:bg-primaryhover hover:text-white hover:border-primaryhover transition-all ease-in-out w-full'
                                        onClick={()=>{close()}}>
                                        Cancel
                                    </div>
                                    <div className={`${editing ? "opacity-50 hover:cursor-not-allowed":"hover:cursor-pointer"} flex items-center justify-center bg-primary p-4 rounded-md font-header uppercase text-white text-xs hover:bg-primaryhover transition-all ease-in-out w-full`}
                                        onClick={()=>{if(editing) return
                                                        formik.handleSubmit()
                                                    }}>
                                        {editing ? "Editing...":"Edit Form Input"}
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
export default EditFormInputModal
