import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { format } from "date-fns"


const ConfirmReactivation = ({open, close, handleReactivation}) => {
    return (
        <Dialog open={open} onClose={()=>{}}>
                    <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                    <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                        <div className='flex min-h-full items-center justify-center p-4'>
                            <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in w-[30vw]'>
                                <div className='bg-white rounded-md h-full p-5 flex flex-col w-full gap-3'>
                                    {/* Header */}
                                    <div className="pb-2 flex flex-col justify-center items-center w-full">
                                            <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Confirm Reactivation</h1>
                                            <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Review the user information for reactivation</p>
                                    </div>

                                    <div className="w-full flex flex-row items-center justify-between gap-1 px-4">
                                        <div className="bg-white border-primary border-2 w-full py-3 rounded-md flex items-center justify-center text-primary hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out cursor-pointer font-header"
                                        onClick={()=>{close()}}>
                                            <p>Cancel</p>
                                        </div>
                                        <div className={`bg-primary border-primary border-2 w-full py-3  rounded-md flex items-center justify-center text-white transition-all ease-in-out cursor-pointer font-header hover:bg-primaryhover`}
                                            onClick={()=>{handleReactivation(), close()}}>
                                            <p>Reactivate</p>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
        </Dialog>
    )
}

export default ConfirmReactivation
