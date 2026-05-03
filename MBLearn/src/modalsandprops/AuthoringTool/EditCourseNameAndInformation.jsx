import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons"
import { Select } from "MBLearn/src/components/ui/select";
import { useFormik } from "formik";
import { useAuthoringTool } from "MBLearn/src/contexts/AuthoringToolContext";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import { useEffect } from "react";
import axiosClient from "MBLearn/src/axios-client";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
const EditCourseNameAndInformation = ({open, close, course, fetchCourse}) => {

    const [loading, setLoading] = useState(false);

    /// --------------------
    /// Division Handling
    /// --------------------
    const [divisionTags, setDivisionTags] = useState([]);
    const [selectedDivision, setSelectedDivision] = useState('');
    const divisions = [
        { id: 1, name: "Finance" },
        { id: 2, name: "HR" },
        { id: 3, name: "IT" },
        { id: 4, name: "Operations" },
        { id: 5, name: "Marketing" },
    ];

    const handleDivisionChange = (e) => {
        const selectedId = e.target.value;
        const selected = divisions.find(d => d.id === parseInt(selectedId));

        if (!selected) {
            setDivisionTags([]);
            setSelectedDivision('');
            formik.setFieldValue('Division', '');
            return;
        }

        setDivisionTags([selected]);
        setSelectedDivision(selectedId);
        formik.setFieldValue('Division', selected.name);
    };

    useEffect(() => {
        if (!course) return;

        const initialDivision = divisions.find(d => d.name === course.Division);

        if (initialDivision) {
            setDivisionTags([initialDivision]);
            setSelectedDivision(initialDivision.id.toString());
            formik.setFieldValue('Division', initialDivision.name);
        } else {
            setDivisionTags([]);
            setSelectedDivision('');
            formik.setFieldValue('Division', '');
        }
    }, [course]);


    const {categories, department, career_level} = useAuthoringTool();
    const {user} = useStateContext();
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            courseName: course.CourseName || '',
            category: course.category_id || '',
            TrainingType: course.TrainingType || '',
            level: course.career_level_id || '',
            Division: course.Division || '',
        },
        onSubmit: async (values) => {
            try {
                setLoading(true);
                await axiosClient.put(`/updateCourseInformation/${course.id}`, values);
                fetchCourse();
                close();
            } catch (error) {
                console.error("The Error: ", error);
            } finally {
                setLoading(false);
            }
        }
    })

    const [confirmExitOpen, setConfirmExitOpen] = useState(false);
    const [confirmingExit, setConfirmingExit] = useState(false);
    const handleCloseClick = () => {
        setConfirmExitOpen(true);
    };

    const confirmExit = () => {
        setConfirmingExit(true);
        setTimeout(() => {
        setConfirmingExit(false);
        setConfirmExitOpen(false);
        formik.resetForm();
        close();
        }, 300);
    };
    const cancelExit = () => {
        setConfirmExitOpen(false);
    };

    useEffect(() => {
        console.log(course?.division_id)
    }, [open])
    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in w-[65vw]'>
                            <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                    <div>
                                        <h1 className="text-primary font-header text-base md:text-2xl">Edit Course Basic Information</h1>
                                        <p className="text-unactive font-text text-xs md:text-sm">Edit the basic course information within the field</p>
                                    </div>
                                    <div className="">
                                        <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out w-5 h-5 text-xs md:w-8 md:h-8 md:text-base"
                                                onClick={handleCloseClick}>
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    <form className="grid grid-cols-3 mx-4 py-2 pb-4 gap-2" onSubmit={formik.handleSubmit}>
                                        <div className="inline-flex flex-col gap-1 py-2 w-full col-span-3">
                                            <label htmlFor="courseName" className="font-text  text-xs flex flex-row justify-between">
                                                <p>Course name: <span className="text-red-500">*</span></p>
                                            </label>
                                            <input type="text" name="courseName"
                                                    value={formik.values.courseName}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    maxLength={100}
                                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            {/* {formik.touched.firstname && formik.errors.firstname ? (<div className="text-red-500 text-xs font-text">{formik.errors.firstname}</div>):null} */}
                                        </div>
                                        <div className="inline-flex flex-col gap-1 ">
                                            <label htmlFor="career_level" className="font-header text-xs flex flex-row justify-between">
                                                <p className="font-text">Career Level: <span className="text-red-500">*</span></p>
                                            </label>
                                            <div class="grid grid-cols-1">
                                                <select id="level" name="level" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                    value={formik.values.level}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                >
                                                <option value="">Select Career Level</option>
                                                {
                                                    career_level.map((level, index) => (
                                                        <option key={index} value={level.id}>{level.name}</option>
                                                    ))
                                                }
                                                </select>
                                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                </svg>
                                            </div>
                                            {/* {formik.touched.career_level_id && formik.errors.career_level_id ? (<div className="text-red-500 text-xs font-text">{formik.errors.career_level_id}</div>):null} */}
                                        </div>
                                        <div className="inline-flex flex-col gap-1 ">
                                            <label htmlFor="category_id" className="font-header text-xs flex flex-row justify-between">
                                                <p className="font-text">Category: <span className="text-red-500">*</span></p>
                                            </label>
                                            <div class="grid grid-cols-1">
                                                <select id="category" name="category" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                    value={formik.values.category}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                >
                                                <option value="">Select Category</option>
                                                {
                                                    categories.map((category, index) => (
                                                        <option key={index} value={category.id}>{category.category_name}</option>
                                                    ))
                                                }
                                                </select>
                                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                </svg>
                                            </div>
                                            {/* {formik.touched.category_id && formik.errors.category_id ? (<div className="text-red-500 text-xs font-text">{formik.errors.category_id}</div>):null} */}
                                        </div>
                                        <div className="inline-flex flex-col gap-1 col-span-1">
                                            <label htmlFor="TrainingType" className="font-header text-xs flex flex-row justify-between">
                                                <p className="font-text">Training Type: <span className="text-red-500">*</span></p>
                                            </label>
                                            <div class="grid grid-cols-1">
                                                <select id="TrainingType" name="TrainingType" class="col-start-1 row-start-1 w-full appearance-none rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text border border-divider"
                                                    value={formik.values.TrainingType}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                >
                                                <option value="">Select Training Type</option>
                                                <option value="mandatory">Mandatory</option>
                                                <option value="non-mandatory">Non-Mandatory</option>

                                                </select>
                                                <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                </svg>
                                            </div>
                                            {/* {formik.touched.TrainingType && formik.errors.TrainingType ? (<div className="text-red-500 text-xs font-text">{formik.errors.TrainingType}</div>):null} */}
                                        </div>
                                        <div className="inline-flex flex-col gap-1 col-span-3">
                                            <label className="font-header text-xs flex flex-row justify-between" htmlFor="Division">
                                                <p className="font-text">Division Tag:</p>
                                            </label>

                                            <div className="relative mb-2">
                                                <select className="w-full appearance-none rounded-md p-2 border border-divider focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary font-text"
                                                    id="Division"
                                                    name="Division"
                                                    value={selectedDivision}
                                                    onChange={handleDivisionChange}
                                                >
                                                    <option value="">Select Division</option>
                                                    {divisions.map((division) => (
                                                        <option key={division.id} value={division.id}>
                                                            {division.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex flex-wrap gap-2 border border-divider rounded-md p-2 min-h-[50px]">
                                                {
                                                    divisionTags.length === 0 ?
                                                    <p className="text-xs text-gray-400 font-text">No division selected</p>
                                                :
                                                    divisionTags.map((tag) => (
                                                        <div className="flex items-center bg-primary text-white px-2 py-1 rounded-md text-xs font-text"
                                                            key={tag.id}
                                                        >
                                                            {tag.name}
                                                            <FontAwesomeIcon className="ml-2 cursor-pointer hover:text-gray-200"
                                                                icon={faXmark}
                                                                onClick={() => {
                                                                    setDivisionTags([]);
                                                                    setSelectedDivision('');
                                                                    formik.setFieldValue('Division', '');
                                                                }}
                                                            />
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>

                                        <div className="col-span-3 flex flex-row justify-end items-center gap-2 mt-4">
                                            <button className="bg-white border-primary border-2 w-full py-3 rounded-md flex items-center justify-center text-primary hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out cursor-pointer font-header"
                                                type="button"
                                                onClick={handleCloseClick}>
                                                Cancel
                                            </button>
                                            <button
                                                className={`
                                                    bg-primary border-primary border-2 w-full py-3 rounded-md flex items-center justify-center text-white transition-all ease-in-out cursor-pointer font-header hover:border-primaryhover hover:bg-primaryhover disabled:opacity-50 disabled:cursor-not-allowed
                                                    ${loading ? 'animate-pulse' : ''}
                                                `}
                                                type="submit"
                                                disabled={loading}
                                            >
                                            {loading ?
                                                <>
                                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                                Saving...
                                                </>
                                            : 
                                                'Save'
                                            }
                                            </button>

                                        </div>
                                    </form>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>

                <ConfirmationModal
                    open={confirmExitOpen}
                    confirm={confirmExit}
                    cancel={cancelExit}
                    confirming={confirmingExit}
                    header="Discard changes?"
                    desc="Are you sure you want to discard your changes and exit? All unsaved changes will be lost."
                />
        </Dialog>
    )
}
export default EditCourseNameAndInformation;
