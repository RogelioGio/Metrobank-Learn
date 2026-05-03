import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useFormik } from "formik"
import { useEffect, useState } from "react";
import { Switch } from "../components/ui/switch";
import * as Yup from "yup"
import axiosClient from "../axios-client";
import { toast } from "sonner";


const CourseAssesmentManagementModal = ({ assessment ,open, close, refresh}) => {
    const [passing, setPassing] = useState(assessment.passing > 0);
    const [maxAttempts, setMaxAttempts] = useState(assessment.maxAttempts > 0)
    const [updating, setUpdating] = useState(false)

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            passing: assessment.passing_percentage || 0,
            maxAttempts: assessment.max_attempt || 0,
            // review: assessment.review || false,
            // history: assessment.history || false,
            // showAnswerKey: assessment.showAnswerKey || false,
        },
        validationSchema: Yup.object({
            passing: Yup.number()
                .typeError("Passing average must be a number")
                .min(0, "Average must be at least 0%")
                .max(100, "Average cannot exceed 100%"),
            maxAttempts: Yup.number()
            .typeError("Max Attempt must be a number")
            .min(1,"Max Attempt must be at least more than 0")
            .max(100, "Max Attempt cannot exceed 100"),
        }),
        onSubmit: (values) => {}
    })

    const handleUpdate = () => {
        setUpdating(true)
        console.log(formik.values)
            axiosClient.put(`/editTest/${assessment.id}`, {
            passing: parseInt(formik.values.passing, 10),
            maxAttempts: parseInt(formik.values.maxAttempts, 10),
        })
        .then((res) => {
            setUpdating(false)
            toast.success('Assessment Updated', {description: "The given assessment is now updated"});
            close();
            refresh()
            setTimeout(()=>{
                formik.resetForm();
            },2000)
        })
        .catch((err)=> {console.log(err)})
    }
    const toggle = (section,field) => {
        formik.setFieldValue(field, section ? formik.initialValues[field] : 0)
    }

    useEffect(() => {
        //console.log("Passing Average Changed: ", passing);
        // console.log("timeLimit", assessment.timeLimit)
        // console.log("Time:", formatSecondsToMMSS(formik.values.timeLimit))
        // console.log("Formik Values: ", formik.values);
        //console.log("review:", formik.values.timeLimit)
    }, [formik.values.timeLimit])

    return (
        <>
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        md:w-[60vw]'>
                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                             {/* Header */}
                            <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                <div>
                                    <h1 className="text-primary font-header
                                                text-base
                                                md:text-2xl">Configure Assessment</h1>
                                    <p className="text-unactive font-text
                                                text-xs
                                                md:text-sm">Configure each aspect of your course assesment for better understanding of learners</p>
                                </div>
                                <div className="">
                                    <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                    w-5 h-5 text-xs
                                                    md:w-8 md:h-8 md:text-base"
                                        onClick={()=>{
                                            if(updating) return
                                            close()
                                            setTimeout(()=>{formik.resetForm()},500)
                                        }}>
                                        <FontAwesomeIcon icon={faXmark}/>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
                                    <div className="flex flex-row gap-x-4 justify-between">
                                        <div className="flex flex-col justify-center items">
                                            <p className="font-header text-primary">Passing Average</p>
                                            <p className="font-text text-xs">Enabling the assesment have an certain passing average threshhold for the each must attain</p>
                                        </div>
                                        <div className="inline-flex flex-col gap-1 items-end ">
                                            <div className="inline-flex flex-col gap-2 items-end">
                                            <label htmlFor="employeeID" className={`font-text text-xs flex flex-row justify-between leading-none`}>
                                                <p>Passing Average Percentage</p>
                                            </label>
                                            <div className="w-full relative">
                                                <input type="" name="passing"
                                                        value={formik.values.passing }
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        maxLength={3}
                                                        inputMode="numeric"
                                                        pattern="\d*"
                                                        className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}/>
                                                <p className="absolute right-2 top-1/2 -translate-y-1/2 font-text text-unactive mr-1">%</p>
                                            </div>
                                            {formik.touched.passing && formik.errors.passing ? (<div className="text-red-500 text-xs font-text">{formik.errors.passing}</div>):null}
                                        </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-x-4 justify-between">
                                        <div className="flex flex-col justify-center items">
                                                <p className="font-header text-primary">Max Attempt</p>
                                                <p className="font-text text-xs">Each learner will only have a specific number of attempt on answering the assessment.</p>
                                        </div>
                                        <div className="inline-flex flex-col gap-2 items-end">
                                            <label htmlFor="employeeID" className="font-text text-xs flex flex-row justify-between leading-none">
                                                <p>Max Attempt Limit</p>
                                            </label>
                                            <div className="relative">
                                                <input type="text" name="maxAttempts"
                                                        value={formik.values.maxAttempts}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        maxLength={3}
                                                        inputMode="numeric"
                                                        pattern="\d*"
                                                        className={`font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}/>
                                                <p className="absolute right-2 top-1/2 -translate-y-1/2 font-text text-unactive mr-1">Attempts</p>
                                            </div>
                                            {formik.touched.maxAttempts && formik.errors.maxAttempts ? (<div className="text-red-500 text-xs font-text">{formik.errors.maxAttempts}</div>):null}
                                            {/* {formik.touched.employeeID && formik.errors.employeeID ? (<div className="text-red-500 text-xs font-text">{formik.errors.employeeID}</div>):null} */}
                                        </div>
                                    </div>
                                    {/* <div className="flex flex-row gap-x-4">
                                        <div className="py-1">
                                            <Switch checked={formik.values.review} onCheckedChange={(checked) =>{formik.setFieldValue("review",checked)}}/>
                                        </div>
                                        <div>
                                            <p className="font-header text-primary">Shows Current Attempt Review</p>
                                            <p className="font-text text-xs">Let the learner to have review page of their current attempt</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-x-4">
                                        <div className="py-1">
                                            <Switch checked={formik.values.history} onCheckedChange={(checked) =>{formik.setFieldValue("history",checked)}}/>
                                        </div>
                                        <div>
                                            <p className="font-header text-primary">Shows Attempts History</p>
                                            <p className="font-text text-xs">The learner is able to see their previous attempt in the course assessment.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-x-4">
                                        <div className="py-1">
                                            <Switch checked={formik.values.showAnswerKey} onCheckedChange={(checked) =>{formik.setFieldValue("showAnswerKey",checked)}}/>
                                        </div>
                                        <div>
                                            <p className="font-header text-primary">Shows Answer Keys</p>
                                            <p className="font-text text-xs">The learner is able to see their previous attempt aswell as the correct answer from the previous attempt in the course assessment.</p>
                                        </div>
                                    </div> */}
                                </form>
                            </div>
                            <div className="flex flex-row justify-between px-4 gap-2">
                                <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center shadow-md text-primary transition-all ease-in-out ${updating ? "opacity-50":"hover:cursor-pointer hover:bg-primary hover:text-white"}`}
                                                onClick={()=>{
                                                    if(updating) return
                                                    close()
                                                    setTimeout(()=>{formik.resetForm()},500)
                                                }}>
                                                <p className="font-header">Cancel</p>
                                </div>
                                <div className={`border-2 border-primary rounded-md py-3 w-full flex flex-row justify-center items-center shadow-md bg-primary text-white  transition-all ease-in-out
                                                ${updating ? "opacity-50":"hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover"}`}
                                            onClick={()=>{
                                                if(updating)return
                                                handleUpdate()
                                            }}>
                                    {
                                        updating ?  <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3"/>
                                            <p className="font-header">Updating...</p>
                                        </> : <>
                                            <p className="font-header">Update</p>

                                        </>
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
export default CourseAssesmentManagementModal
