// For Symposium only and must be deleted after Symposium 2025
import { faBullhorn, faCalendarPlus, faPeopleArrows, faRotateLeft, faSpinner, faTriangleExclamation, faUserXmark, faXmark, faXmarkCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { RingProgress } from "@mantine/core"
import { differenceInDays, format, set } from "date-fns"
import { useEffect, useState } from "react"
import WarningModal from "./AuthoringTool/WarningModals"
import SuccessModal from "./AuthoringTool/SuccessModal"
import axiosClient from "../axios-client"
import TraningDurationModal from "./TrainingDurationModal"
import { toast } from "sonner"

const ResetUserProgressModal = ({open, close, learner, course}) => {
    const [loading, setLoading] = useState(false)
    const [reseting, setResetting] = useState(false)
    const [reset, setReset] = useState(false)
    const [done, setDone] = useState(false)

    const HandleResetProgress = () => {
        setResetting(true)
        axiosClient.put(`/resetProgress/${learner.user_id}/${course.id}`)
            .then((data)=>{
                console.log(data)
            }).catch((err)=>{console.log(err)})
        setTimeout(()=>{
            toast.success("The user is sucessfully reseted")
            close()
            console.log(
                {
                    Learner: learner,
                    course: course
                }
            )
        }, 5000)
        setTimeout(()=>{setResetting(false)}, 6000)
    }

    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[30vw]'>
                            <div className='bg-white rounded-md h-full flex flex-col p-6 items-center justify-center gap-5'>
                                <div className="aspect-square w-20 bg-primarybg rounded-full flex flex-col items-center justify-center text-3xl">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-primary"/>
                                </div>
                                <div className="flex flex-col  justify-center items-center">
                                    <p className="font-header text-primary text-2xl">Reset User Progress</p>
                                    <p className="font-text text-xs text-center">By confirm this process you will be erasing all the existed progress of the user. included thier own enrollement and certification</p>
                                </div>
                                <div className="grid grid-cols-2 grid-rows-[min-content_1fr] gap-2 w-full">
                                    <div className={`font-header text-primary border-2 border-primary rounded-md py-2 flex flex-row gap-2 justify-center items-center hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer transition-all ease-in-out`}
                                        onClick={()=>{
                                            if(reseting) return;
                                            close()
                                        }}>
                                        Cancel
                                    </div>
                                    <div className={`bg-primary font-header text-white border-2 border-primary rounded-md py-2 flex flex-row gap-2 justify-center items-center hover:bg-primaryhover hover:border-primaryhover hover:text-white hover:cursor-pointer transition-all ease-in-out ${reseting && "opacity-50 cursor-not-allowed"}`}
                                        onClick={() => {
                                            if(reseting) return;
                                            HandleResetProgress()}}>

                                                {
                                                    reseting ?
                                                    <>
                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin"/>
                                                    <p>Reseting</p>
                                                </>
                                                :
                                                <>
                                                    <FontAwesomeIcon icon={faRotateLeft}/>
                                                    <p>Reset Learner</p>
                                                </>
                                            }
                                            </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>

        </Dialog>
    )
}
export default ResetUserProgressModal
