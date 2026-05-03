import { Menu, MenuButton, MenuItem, MenuItems, Disclosure, DisclosureButton, DisclosurePanel, Dialog, DialogBackdrop, DialogPanel, DialogTitle} from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderPlus, faSearch, faArrowDownWideShort, faPlus, faMinus, faChevronUp, faChevronDown, faPenToSquare, faTrash, faChevronLeft, faChevronRight, faLaptopFile, faChalkboardTeacher, faCheck, faCircleLeft, faPencil, faXmark, faBook, faFile, faSpinner,} from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark as solidXmark } from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark as regularXmark } from "@fortawesome/free-regular-svg-icons";
import { useEffect, useState } from 'react';
import dayjs from "dayjs";
import React from 'react';
import { useNavigate } from 'react-router';
import { useCourse } from '../contexts/Course';
import { useStateContext } from '../contexts/ContextProvider';
import axiosClient from '../axios-client';
import { toast } from 'sonner';

const CourseDetailsModal = ({open,close,classname,}) => {
    const navigate = useNavigate();
    const [hover, setHover] = useState();
    const {course, setCourse} = useCourse()
    const {user} = useStateContext();
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setHover(false);
    },[])

    const selectedCourse = {}

    const handleExportCert = () => {
        setLoading(true);
        axiosClient.get(`/getCert/${user.user_infos.id}/${course.id}`
            , {responseType: 'blob'})
        .then(({data}) => {
            const certificate = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(certificate);

            window.open(url);
            setLoading(false);
        })
        .catch((e) => {
            toast.error("No certificate found for this course or for this user.");
            setLoading(false);
        })
    }


    return(
        <Dialog open={open} onClose={()=>{}} className={classname}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40"/>
            <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4 text center'>
                    <DialogPanel transition className='w-[50rem] transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'>
                            {
                                course ?
                                <div className='bg-white rounded-md h-fit flex flex-col'>
                                    {/* Thumbnail */}
                                    <div className='bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-md'>
                                        <div className="flex flex-col bg-gradient-to-b from-transparent to-black rounded-t-md gap-4">
                                            <div className='p-4 flex flex-col gap-y-4'>
                                                <div className='flex items-center justify-end'>
                                                    <div className='border-2 border-white rounded-full text-white flex items-center justify-center hover:bg-white hover:text-primary hover:cursor-pointer transition-all ease-in-out
                                                        w-5 h-5 text-xs
                                                        md:w-8 md:h-8 md:text-base'
                                                        onClick={close}>
                                                        <FontAwesomeIcon icon={faXmark}/>
                                                    </div>
                                                </div>
                                                <div className='px-4 flex flex-col gap-1'>
                                                    {/* <h2 className='font-header text-white text-base md:text-2xl'>{selectedCourse?.CourseName}</h2>
                                                    <p className='text-xs text-white font-text'>Course ID: {selectedCourse?.CourseID}</p> */}
                                                    <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text w-fit">Mandatory</span>
                                                    <div>
                                                        <h2 className='font-header text-white text-base md:text-2xl'>{course.courseName}</h2>
                                                        <p className='text-xs text-white font-text'>{course.courseID} - ({course.categories.category_name} - {course.career_level.name} Level)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='px-8 pt-4 pb-2 flex flex-col md:flex-row md:gap-10'>
                                        <div className='flex flex-col justify-center py-1 font-text'>
                                            <p className='font-text text-xs text-unactive'>Overview:</p>
                                            <p className='text-xs'>{course.overview}</p>
                                        </div>
                                    </div>
                                    <div className='px-8 pb-4'>
                                        <p className='font-text text-xs text-unactive'>Objectve:</p>
                                        <p className='font-text text-xs'>{course.objective}</p>
                                    </div>
                                    <div className='px-8 pb-4 flex flex-row gap-2 justify-between items-center'>
                                        <div className='bg-white w-full py-2 flex items-center justify-center border-primary border-2 rounded-md font-header text-primary gap-2  hover:bg-primaryhover hover:text-white hover:cursor-pointer transition-all ease-in-out'
                                            onClick={()=>{navigate(`/learner/course/${course.id}`); setCourse(null);}}>
                                            <FontAwesomeIcon icon={faBook}/>
                                            <p>Open Course</p>
                                        </div>
                                        <div className={`w-full py-2 flex items-center justify-center border-primary border-2 rounded-md font-header text-white gap-2 bg-primary hover:bg-primaryhover hover:text-white hover:cursor-pointer transition-all ease-in-out ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                                            onClick={()=>{
                                                if(!loading){
                                                    handleExportCert()
                                                }
                                            }}>
                                            {
                                                loading ? <>
                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3"/>
                                                    <p>Exporting</p>
                                                </>
                                                :
                                                <>
                                                    <FontAwesomeIcon icon={faFile}/>
                                                    <p>Export Certificate</p>
                                                </>
                                            }

                                        </div>
                                    </div>
                                </div>
                                : null
                            }
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default CourseDetailsModal
