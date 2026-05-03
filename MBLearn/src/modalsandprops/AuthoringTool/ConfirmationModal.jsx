import { faCircleCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

const ConfirmationModal = ({ open, confirm, cancel, header, desc, confirming }) => {
    return (
        <Dialog open={open} onClose={() => {}}>
            <DialogBackdrop
                transition
                className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"
            />
            <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                    w-[80vw]
                                    sm:w-[30vw]"
                    >
                        <div className="bg-white rounded-md h-full w-full p-5 flex flex-col items-center gap-2">
                            <div>
                                <div className="bg-blue-100 w-28 h-28 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-blue-600 text-6xl" />
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center">
                                <p className="font-header text-2xl text-blue-600">{header}</p>
                                <p className="font-text text-xs text-gray-700">{desc}</p>
                            </div>
                            <div className="w-full flex flex-row items-center justify-between gap-1">
                                <div
                                    className="bg-white border-blue-600 border-2 w-full py-3 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all ease-in-out cursor-pointer font-header"
                                    onClick={cancel}
                                >
                                    <p>Cancel</p>
                                </div>
                                <div
                                    className={`bg-blue-600 border-blue-600 border-2 w-full py-3 rounded-md flex items-center justify-center text-white transition-all ease-in-out cursor-pointer font-header ${
                                        confirming ? "opacity-50 cursor-not-allowed" : "hover:border-blue-700 hover:bg-blue-700"
                                    }`}
                                    onClick={() => {
                                        if (confirming) return;
                                        confirm();
                                    }}
                                >
                                    {confirming ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-lg" />
                                            <p className="ml-2">Confirming...</p>
                                        </>
                                    ) : (
                                        <p>Yes, Proceed</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ConfirmationModal;
