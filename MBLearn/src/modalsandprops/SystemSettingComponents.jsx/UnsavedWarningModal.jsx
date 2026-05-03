import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"

const UnsavedWarningModal = ({isOpen, close, onContinue}) => {
    return(
        <Dialog open={isOpen} onClose={() => {}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50"/>
                <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='p-5 transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                            <div className="grid gap-y-2 p-2">
                                {/* Logo */}
                                <div className="flex flex-col justify-center items-center">
                                    <div className=" w-fit p-5 flex justify-center items-center aspect-square bg-primarybg rounded-full">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-primary" />
                                    </div>
                                </div>
                                {/* Header */}
                                <div className="text-center">
                                    <h1 className="font-header text-primary text-xl">Unsaved Changes</h1>
                                </div>
                                {/* Description */}
                                <div className="text-center">
                                    <p className="font-text text-unactive text-sm">Unsaved changes detected! Don't forget to save <br /> to keep your updates in MBlearn.</p>
                                </div>
                                {/* Choices */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="py-2 px-4 border-2 border-primary rounded-md shadow-md font-header text-primary text-center hover:bg-primary hover:cursor-pointer hover:scale-105 hover:text-white transition-all ease-in-out" onClick={close}>Cancel</div>
                                    <div className="py-2 px-4 border-2 border-primary bg-primary rounded-md shadow-md font-header text-white text-center hover:bg-primary hover:cursor-pointer hover:scale-105 hover:text-white transition-all ease-in-out" onClick= {() =>{onContinue(); close();}}>Continue</div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>
    )
}

export default UnsavedWarningModal
