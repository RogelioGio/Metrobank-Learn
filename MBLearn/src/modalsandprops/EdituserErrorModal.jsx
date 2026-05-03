import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"

const EdituserErrorModal = ({error, close, message, desc={} }) => {
    return (
        <Dialog open={error} onClose={close}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40"/>
            <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                        <div className='bg-white rounded-md h-full w-[50vw] p-5 flex flex-row'>
                            {/* icon */}
                            <div className="p-5">
                                <div className="p-5 aspect-square flex items-center justify-center bg-primarybg rounded-full">
                                    <FontAwesomeIcon   icon={faTriangleExclamation} className="text-primary text-4xl"/>
                                </div>
                            </div>
                             {/* Description */}
                            <div className="p-5">
                                    {/* Header */}
                                    <div className="py-4 border-divider border-b">
                                        <p className="font-header uppercase text-primary text-2xl">Caution: Operation Aborted</p>
                                    </div>
                                    {/* Body */}
                                    <div className="py-4">
                                        <p className="font-text text-sm text-unactive">The user could not be edited to the system records due to an error. The operation has been aborted due to the following reason:</p>
                                    </div>
                                    {/* Error Message */}
                                    <div>
                                        {/* Specific Error */}
                                        {
                                            Object.keys(desc).length>0 && (
                                                <div>
                                                    {Object.keys(desc).map((key, index) => (
                                                        <div key={index} className="py-1">
                                                        <p className="font-text text-sm text-unactive"> - {desc[key].join(', ')}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        }
                                    </div>

                                    <div className="py-4">
                                        <p className="font-text text-sm text-unactive"> Please address this issue before attempting again.</p>
                                    </div>

                                    {/* Button confirmation */}
                                    <div className="py-4">
                                        <button className="font-header text-white rounded-md bg-primary p-3 w-full hover:scale-105 hover:bg-primaryhover transition-all ease-in-out" onClick={close}>Confirm</button>
                                    </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default EdituserErrorModal
