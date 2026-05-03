import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useFormik } from "formik"

const CreateCategoryModal = ({ open, close, }) => {
    const formik = useFormik({
        initialValues: {
            categoryName: "",
        }
    })


        return (
            <Dialog open={open} onClose={()=>{}}>
                <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
                    <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                        <div className='flex min-h-full items-center justify-center p-4'>
                            <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                                                    w-[100vw]
                                                                                    md:w-[50vw]'>
                                <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                                    {/* Header */}
                                    <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                        <div>
                                            <h1 className="text-primary font-header
                                                        text-base
                                                        md:text-2xl">Create Category</h1>
                                            <p className="text-unactive font-text
                                                        text-xs
                                                        md:text-sm">Create an category to add courses</p>
                                        </div>
                                        <div className="">
                                            <div className="border-2 border-primary rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out
                                                            w-5 h-5 text-xs
                                                            md:w-8 md:h-8 md:text-base"
                                                onClick={()=>{
                                                    close()
                                                }}>
                                                <FontAwesomeIcon icon={faXmark}/>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="py-2 px-4 w-full">
                                        <div className="inline-flex flex-col gap-1 py-2 w-full
                                                                        md:col-span-3">
                                            <label htmlFor="categoryName" className="font-text text-xs flex flex-row justify-between">
                                                <p>Category Name <span className="text-red-500">*</span></p>
                                            </label>
                                            <input type="text" name="categoryName"
                                                    value={formik.values.categoryName}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    maxLength={11}
                                                    className="font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"/>
                                            {formik.touched.categoryName && formik.errors.categoryName ? (<div className="text-red-500 text-xs font-text">{formik.errors.categoryName}</div>):null}
                                        </div>
                                    </div>
                                    {/* Action */}
                                    <div className="flex flex-row justify-end items-center gap-2 px-4">
                                        <div className="w-full flex flex-row items-center justify-between gap-1">
                                            <div className="bg-white border-primary border-2 w-full py-3 rounded-md flex items-center justify-center text-primary hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out cursor-pointer font-header">
                                                <p>Cancel</p>
                                            </div>
                                            <div className="bg-primary border-primary border-2 w-full py-3  rounded-md flex items-center justify-center text-white hover:border-primaryhover hover:bg-primaryhover transition-all ease-in-out cursor-pointer font-header">
                                                <p>Add Category</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </DialogPanel>
                        </div>
                    </div>

            </Dialog>
    )
}
export default CreateCategoryModal;
