import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus, faSearch, faArrowDownWideShort, faPlus, faMinus, faChevronUp, faChevronDown, faPenToSquare, faTrash, faChevronLeft, faChevronRight, faLaptopFile, faChalkboardTeacher, faCheck, faBars } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Toggle } from "../Components/ui/toggle";


const CourseListCard = ({courseList, classname, onclick, action}) => {
    const navigate = useNavigate();
    return (
        <div className={classname}>
            {
                courseList.map((course) => (

                    // card
                    <div key={course.id} className='w-full h-fit flex flex-row rounded-md bg-white shadow-md hover:scale-105 hover:cursor-pointer transition-all ease-in-out'  onClick={() => navigate(`/courseadmin/course/${course.id}`)}>
                        {/* Course Image */}
                        <div className='w-32 h-full rounded-tl-md rounded-bl-md bg-primary'>
                            <img src="" alt="" className='w-full' />
                        </div>
                        {/* Course Info */}
                        <div className='p-5 w-full flex flex-col gap-5'>
                            {/* Course Name Header */}
                            <div className='flex flex-row place-content-between items-center gap-5'>
                                {/* Course Name */}
                                <div className='text-primary flex flex-col w-full gap-2'>
                                    <div className='flex flex-row justify-between'>
                                        <div>
                                            <p className="text-sm font-header text-unactive">Course Name:</p>
                                            <h2 className='font-header text-xl'>{course.name}</h2>
                                        </div>

                                        <div className="h-full">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                    {/* <div className="hover:scale-105 ease-in-out transition-all hover:cursor-pointer group-data-[state=open]:bg-primary group-data-[state=open]:text-white" onClick={(e)=> e.stopPropagation()}>
                                                        <FontAwesomeIcon icon={faBars} className="border-2 border-primary rounded-md aspect-square p-2 text-sm text-primary shadow-md hover:bg-primary hover:text-white"/>
                                                    </div> */}

                                                <button className="group hover:scale-105 ease-in-out transition-all hover:cursor-pointer" onClick={(e)=> e.stopPropagation()}>
                                                    <FontAwesomeIcon icon={faBars} className="group-data-[state=open]:bg-primary group-data-[state=open]:text-white border-2 border-primary rounded-md aspect-square p-2 text-sm text-primary shadow-md hover:bg-primary hover:text-white"/>
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent side="bottom" align="end" className="shadow-md w-fit">
                                                <div className="flex flex-col gap-1 justify-start">
                                                    <div className="py-2 px-3 rounded-md flex flex-row gap-2 items-center text-primary hover:bg-secondaryprimary transition-all ease-in-out cursor-pointer text-xs" onClick={(e) => action(e, "assignCourseAdmin",course.id)}>
                                                        <FontAwesomeIcon icon={faChalkboardTeacher}/>
                                                        <p>Assign Course Admin</p>
                                                    </div>
                                                    <div className="py-2 px-3 rounded-md flex flex-row gap-2 items-center text-primary hover:bg-secondaryprimary transition-all ease-in-out cursor-pointer text-xs" onClick={(e) => action(e, "openEditCourse",course.id)}>
                                                        <FontAwesomeIcon icon={faPenToSquare}/>
                                                        <p>Edit Course</p>
                                                    </div>
                                                    <div className="py-2 px-3 rounded-md flex flex-row gap-2 items-center text-primary hover:bg-secondaryprimary transition-all ease-in-out cursor-pointer text-xs" onClick={(e) => action(e, "openDeleteCourse")}>
                                                        <FontAwesomeIcon icon={faTrash}/>
                                                        <p>Delete</p>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                </div>
                                    </div>
                                    <div className="grid grid-cols-[1fr_1fr_auto] gap-1">
                                        <p className='text-sm font-header text-unactive col-start-1 row-start-1'> Course Type: <span className="font-text">{course.types[0]?.type_name || "No Type"}</span></p>
                                        <p className='text-sm font-header text-unactive col-start-1 row-start-2'> Course Category: <span className="font-text">{course.categories[0]?.category_name || "No Category" }</span></p>
                                        <p className='text-sm font-header text-unactive col-start-2 row-start-1'> Training Type: <span className="font-text">{course.training_type || "No Training Type" }</span></p>
                                        <p className="text-sm font-header text-unactive col-start-2 row-start-2">Date Added: <span className="font-text">{dayjs(course.create_at).format("MMMM DD, YYYY")}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}

export default CourseListCard;
