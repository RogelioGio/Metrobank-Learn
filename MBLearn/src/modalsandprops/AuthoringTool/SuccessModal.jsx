import { faCheck, faCircleCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"


const SuccessModal = ({ open, close, header, desc, confirmLabel}) => {
    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                            w-[80vw]
                                                            sm:w-[30vw]'>
                            <div className='bg-white rounded-md h-full w-full p-5 flex flex-col items-center gap-2'>
                                <div>
                                    <div className="bg-primarybg w-28 h-28 rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-primary text-6xl" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center">
                                    <p className="font-header text-2xl text-primary">{header}</p>
                                    <p className="font-text text-xs">{desc}</p>
                                </div>
                                <div className="w-full">
                                    <div className="bg-primary w-full py-3 border-2  rounded-md flex items-center justify-center text-white hover:bg-primaryhover transition-all ease-in-out cursor-pointer font-header" onClick={close}>
                                        <p>{confirmLabel || "Confirm"}</p>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>
    )
}
export default SuccessModal
