import { faCircleXmark as regularXmark } from "@fortawesome/free-regular-svg-icons"
import { faBookBookmark, faBookOpen, faSpinner, faUserGroup, faUserLock, faXmark, faCircleXmark as solidXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useEffect, useState } from "react"
import axiosClient from "../axios-client"
import { useFormik } from "formik"
import { useCourseContext } from "../contexts/CourseListProvider"
import { set } from "date-fns"
import UnsavedEditUserPromptModal from "./UnsaveEditUserPromptModal"
import EditCourseSuccesFully from "./EditCourseSuccessfully"


const EditCourseModal = ({open, close, id, course, refresh}) => {
    const [loading, setLoading] = useState(false)
    // const {selectedCourse = [] , selectCourse, isFetching, Course} = useCourse()
    const {coursetypes, coursecategories, trainingmodes} = useCourseContext();
    const [tab, setTab] = useState(1);
    const [changes, setChanges] = useState({});
    const [unsave, setUnsave] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updated, setUpdated] = useState(false);
    const [unsavePromt, setUnsavePrompt] = useState(false);

    // useEffect(() => {
    //     if (open && id) {
    //         formik.resetForm();
    //         if (selectedCourse?.id === id) {
    //             setLoading(false);
    //             } else {
    //                 setLoading(true);
    //                 selectCourse(id);
    //             }
    //         }
    //     return;
    //     }, [id, selectedCourse, open]);
    //     useEffect(() => {
    //         if (selectedCourse && !isFetching) {
    //             setLoading(false);
    //         }
    //     }, [selectedCourse, isFetching]);


        const formik = useFormik({
            enableReinitialize: true,
            initialValues: loading ? {
                courseName: "Loading...",
                courseType: "Loading...",
                courseCategories: "Loading...",
                training_type: "Loading...",
                training_mode: "Loading...",
                months: "Loading...",
                weeks: "Loading...",
                days: "Loading...",
                shortDescription: "Loading...",
                course_objectives: "Loading...",
                course_outcome: "Loading...",
            }:{
                courseName: course?.name || "",
                courseType: course?.types?.[0].id|| "",
                courseCategories: course?.categories?.[0]?.id || "",
                training_type: course?.training_type || "",
                training_mode: course?.training_modes?.[0]?.id || "",
                shortDescription: course?.description || "",
                months: course?.months || "0",
                weeks: course?.weeks || "0",
                days: course?.days || "0",
                course_objectives: course?.course_objectives || "",
                course_outcome: course?.course_outcomes || "",
            },
            onSubmit: (values) => {
                handleUpdate(values)
            }
        })

        //Change Detector
            useEffect(()=>{
                const  newChanges= {}
                for(const key in formik.values){
                    if(Object.prototype.hasOwnProperty.call(formik.values, key)){
                        newChanges[key] = formik.values[key] !== formik.initialValues[key];
                    }
                }
                setChanges(newChanges)
                const isChanged = Object.keys(formik.values).some(
                    (key) => formik.values[key] !== formik.initialValues[key]
                )
                setUnsave(isChanged)
            },[formik.values])

        const handleUpdate = (values) => {
            console.log("Updating Course with values: ", values);
            setUpdating(true);
            setTimeout(() => {setUpdating(false)}, 4000)
            setTimeout(() => {setUpdated(true)}, 4100)
        }

        return(
        <>
        <Dialog open={open} onClose={()=>{}} className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        md:w-[80vw]'>
                            <div className="bg-white rounded-md h-full p-5 flex flex-col">
                                {/* Header */}
                                <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                    <div>
                                        <h1 className="text-primary font-header
                                                    text-base
                                                    md:text-2xl">Edit Course Detail</h1>
                                        <p className="text-unactive font-text
                                                text-xs
                                                md:text-sm">Modify course details to keep content accurate, updated, and engaging.</p>
                                    </div>
                                    {/* Close Button */}
                                    <div className="">
                                        <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                        w-5 h-5 text-xs
                                                        md:w-8 md:h-8 md:text-base"
                                            onClick={()=>{
                                                if(unsave){
                                                    setUnsavePrompt(true)
                                                    return;
                                                }
                                                setTimeout(()=>{formik.resetForm(),setTab(1)},500)
                                                close()
                                            }}>
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex flex-row rounded-md hover:cursor-pointer shadow-md mx-4 mt-2">
                                    <span className={`w-1/2 flex flex-row  items-center font-header ring-2 ring-primary rounded-l-md px-5 py-2 text-primary hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 1 ? 'bg-primary text-white' : ''}
                                                        text-sm gap-4
                                                        md:text-md md:gap-5`} onClick={() =>{setTab(1)}}>
                                        <FontAwesomeIcon icon={faBookOpen} className="md:text-base text-xl"/>
                                        Basic Course Information
                                    </span>
                                    <span className={`w-1/2 flex flex-row  items-center font-header ring-2 ring-primary rounded-r-md px-5 py-2 text-primary hover:bg-primary hover:text-white transition-all ease-in-out ${tab === 2 ? 'bg-primary text-white' : ''}
                                                        text-sm gap-4
                                                        md:text-md md:gap-5`} onClick={() =>{setTab(2)}}>
                                        <FontAwesomeIcon icon={faBookBookmark} className="md:text-base text-xl"/>
                                        Additional Course Information
                                    </span>
                                </div>

                                {/* Update Form */}
                                <form onSubmit={formik.handleSubmit}>
                                {
                                    tab === 1 ? (
                                    <>
                                    <div className='grid grid-cols-3 px-4 py-2 md:gap-x-2'>
                                            {/* Course Name */}
                                            <div className="inline-flex flex-col gap-1 row-start-1 col-span-3 py-1">
                                                <label htmlFor="courseName" className="font-text text-xs flex flex-row justify-between">
                                                    <p>Course Name:</p>
                                                </label>
                                                <input type="text" name="courseName"
                                                        className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.courseName ? "border-2 border-primary":""}`}
                                                        value={formik.values.courseName}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        disabled={loading}/>
                                            </div>
                                            {/* Course Type */}
                                            <div className="inline-flex flex-col gap-1 col-span-3 py-1
                                                            md:col-span-1 md:col-start-1">
                                                <label htmlFor="courseType" className="font-text text-xs flex flex-row justify-between">
                                                    <p>Course Type:</p>
                                                </label>
                                                <div className="grid grid-cols-1">
                                                    <select id="courseType" name="courseType" className={`appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.courseType ? "border-2 border-primary":""}`}
                                                        value={formik.values.courseType}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        disabled={loading}>
                                                        <option value="">Select Type</option>
                                                        {
                                                            coursetypes.map((coursetype) => (
                                                                <option key={coursetype.id} value={coursetype.id}>{coursetype.type_name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {/* Course Category */}
                                            <div className="inline-flex flex-col gap-1 col-span-3 py-1
                                                            md:col-span-1 md:col-start-2">
                                                <label htmlFor="courseCategory" className="font-text text-xs flex flex-row justify-between">
                                                    <p>Course Category:</p>
                                                </label>
                                                <div className="grid grid-cols-1">
                                                    <select id="courseCategory" name="courseCategory" className={`appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.courseCategory ? "border-2 border-primary":""}`}
                                                        value={formik.values.courseCategories}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        disabled={loading}>
                                                        <option value="">Select Category</option>
                                                        {
                                                            coursecategories.map((category) => (
                                                                <option key={category.id} value={category.id}>{category.category_name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>

                                            </div>
                                            <div className="inline-flex flex-col gap-1 col-span-3 py-1
                                                            md:col-span-1 md:col-start-3">
                                                <label htmlFor="training_type" className="font-text text-xs flex flex-row justify-between">
                                                    <p>Training Type:</p>
                                                </label>
                                                <div className="grid grid-cols-1">
                                                    <select id="training_type" name="training_type" className={`appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.training_type ? "border-2 border-primary":""}`}
                                                        value={formik.values.training_type}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        disabled={loading}>
                                                        <option value="">Select Training Type</option>
                                                        <option value="Mandatory">Mandatory</option>
                                                        <option value="Non-Mandatory">Non-Mandatory</option>

                                                    </select>
                                                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>

                                            </div>

                                            <div className="col-span-3 py-1 grid grid-cols-3 gap-2">
                                                <p className="text-xs font-text col-span-3">Default Course Time Span:</p>

                                                <div className="inline-flex flex-col gap-1">
                                                    <input type="text" name="months"
                                                            className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.months ? "border-2 border-primary":""}`}
                                                            value={formik.values.months}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            disabled={loading}/>
                                                    <label htmlFor="months" className="font-text text-xs flex flex-row justify-between">
                                                        <p>Months</p>
                                                    </label>
                                                </div>
                                                <div className="inline-flex flex-col gap-1">
                                                    <input type="text" name="weeks"
                                                            className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.weeks ? "border-2 border-primary":""}`}
                                                            value={formik.values.weeks}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            disabled={loading}/>
                                                    <label htmlFor="weeks" className="font-text text-xs flex flex-row justify-between">
                                                        <p>Weeks</p>
                                                    </label>
                                                </div>
                                                <div className="inline-flex flex-col gap-1">
                                                    <input type="text" name="days"
                                                            className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary ${changes?.days ? "border-2 border-primary":""}`}
                                                            value={formik.values.days}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            disabled={loading}/>
                                                    <label htmlFor="days" className="font-text text-xs flex flex-row justify-between">
                                                        <p>Day</p>
                                                    </label>
                                                </div>
                                            </div>
                                    </div>
                                    </>
                                    ) : tab === 2 ? (
                                        <div className="grid grid-cols-2 px-4 py-2 gap-x-2">
                                            {/* Short Description */}
                                            <div className="inline-flex flex-col gap-1 row-start-1 col-span-2 py-1">
                                                <label htmlFor="description" className="font-text text-xs flex flex-row justify-between ">Short Description:</label>
                                                <textarea name="shortDescription" id="shortDescription" className={`h-32 font-text text-xs md:text-base border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary resize-none ${changes?.shortDescription ? "border-2 border-primary":""}`}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.shortDescription}
                                                disabled={loading}></textarea>
                                            </div>
                                            <div className="inline-flex flex-col gap-1 col-span-2 md:col-span-1 py-1">
                                                <label htmlFor="description" className="font-text text-xs flex flex-row justify-between ">Course Objective:</label>
                                                <textarea name="course_objective" id="course_objective" className={`h-32 font-text text-xs md:text-base border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary resize-none ${changes?.course_objective ? "border-2 border-primary":""}`}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.course_objectives}
                                                disabled={loading}></textarea>
                                            </div>
                                            <div className="inline-flex flex-col gap-1 col-span-2 md:col-span-1 py-1">
                                                <label htmlFor="description" className="font-text text-xs flex flex-row justify-between ">Course Outcome:</label>
                                                <textarea name="course_outcome" id="course_outcome" className={`h-32 font-text text-xs md:text-base border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary resize-none ${changes?.course_outcome ? "border-2 border-primary":""}`}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.course_outcome}
                                                disabled={loading}></textarea>
                                            </div>
                                        </div>
                                    ) : null
                                }
                                </form>

                                {/* Buttons */}
                                <div className="flex flex-row justify-between items-center gap-2  mx-4 pb-2 font-header">
                                    <div className="border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                                        onClick={()=>{
                                            if(unsave){
                                                    setUnsavePrompt(true)
                                                    return;
                                                }
                                                setTimeout(()=>{formik.resetForm(),setTab(1)},500)
                                                close()
                                        }}>
                                        <p>Cancel</p>
                                    </div>
                                    <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md bg-primary text-white  transition-all ease-in-out ${loading || updating ? "opacity-50 hover:cursor-not-allowed" : !unsave ? "opacity-50 hover:cursor-not-allowed" : "hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover"}`}
                                        onClick={()=>{
                                            if(!unsave || loading || updating) return;
                                            formik.handleSubmit()
                                        }}>
                                        {
                                            updating ?
                                            <div className="flex-row flex gap-2 items-center">
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-lg"/>
                                                <p>Updating...</p>
                                            </div> :
                                            <p>Update</p>
                                        }
                                    </div>

                                    {/*
                                        <div className="flex-row flex gap-2 items-center">
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-lg"/>
                                            <p>Submitting...</p>
                                        </div>
                                    */}
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>
        <UnsavedEditUserPromptModal
            open={unsavePromt} close={()=>{setUnsavePrompt(false)}}
            discardChanges={()=>{
                    setUnsavePrompt(false),close()
                    setTimeout(()=>{formik.resetForm(),setTab(1)},500)
                }}/>
        <EditCourseSuccesFully open={updated} close={()=>{setUpdated(false),close(),refresh(),setTimeout(()=>{formik.resetForm(),setTab(1)},500)}} />
        </>

    )
}
export default EditCourseModal
