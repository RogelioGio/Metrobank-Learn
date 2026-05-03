import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"

const Unerollnment = ({isOpen, close, onContinue}) => {
    return(
        <Dialog open={isOpen} onClose={() => {}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50"/>
                <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='p-5 transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                            <div className="flex flex-col items-center justify-center gap-y-2">
                                <p className="font-header text-primary text-2xl pt-3">Cancel Enrollment?</p>
                                <p className="text-center font-text text-unactive leading-snug text-sm">You have selected several learner. <br/> You really want to cancel enrollment?</p>

                                <div className="flex flex-row w-full gap-1 pt-3 px-2">
                                <div className="w-full border-2 border-primary rounded-md py-3 px-16 flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:border-primaryhover hover:bg-primaryhover hover:text-white transition-all ease-in-out" onClick={close}>
                                    <p className="font-header">
                                        Back
                                    </p>
                                </div>
                                <div className="w-full bg-primary border-2 border-primary rounded-md py-3 px-16 flex flex-row justify-center shadow-md text-primary hover:cursor-pointer hover:border-primaryhover hover:bg-primaryhover hover:text-white transition-all ease-in-out"
                                    onClick={onContinue}>
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

export default Unerollnment
