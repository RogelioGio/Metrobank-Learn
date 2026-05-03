import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"

const CancelEnrollmentModal = ({open,close,discardChanges}) => {
    return(
        <Dialog open={open} onClose={() => {}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50"/>
            <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4 text center'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                        <div className='bg-white rounded-md h-full w-fit p-5 flex flex-col items-center justify-center'>
                            <div className="text-center flex-col flex gap-1 px-2 pb-4 pt-2">
                                <h1 className="text-primary font-header text-xl">Cancel Enrollment</h1>
                                <p className="text-unactive font-text text-xs">You have unsaved changes. <br/> Are you sure you want to leave without enrolling the selected learners?</p>
                            </div>
                            <div className="flex flex-row w-full gap-1">
                                <div className="w-1/2 border-2 border-primary rounded-md py-3 flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out" onClick={close}>
                                    <p className="font-header">
                                        {/* {formCompleted.length <= 0 ? "Cancel" : "Back"} */}
                                        Back
                                    </p>
                                </div>
                                <div className="w-1/2 text-center flex-col flex p-4 bg-primary rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover ease-in-out transition-all"
                                    onClick={discardChanges}>
                                    <p className="font-header text-white">Cancel</p>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default CancelEnrollmentModal
