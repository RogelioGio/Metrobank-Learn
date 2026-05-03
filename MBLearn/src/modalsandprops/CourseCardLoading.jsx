import { faChalkboardTeacher, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";

const CourseCardLoading = () => {
    return(
        <>
            {Array(3).fill(0).map((_, index) => (
                <div key={index} className='w-full h-fit flex flex-row rounded-md bg-white shadow-md hover:scale-105 hover:cursor-pointer transition-all ease-in-out'  onClick={() => navigate(`/systemadmin/course/${course.id}`)}>
                        {/* Course Image */}
                        <div className='w-32 h-full rounded-tl-md rounded-bl-md bg-primary'>
                            <img src="" alt="" className='w-full' />
                        </div>
                        {/* Course Info */}
                        <div className='p-5 w-full flex flex-col gap-5'>
                            {/* Course Name Header */}
                            <div className='flex flex-row place-content-between items-center mb-2'>
                                {/* Course Name */}
                                <div className='text-primary'>
                                    <h2 className='font-header text-xl'>Loading...</h2>
                                    <p className='font-text text-sm text-secodary'>Loading...</p>
                                </div>
                                {/* Course Action */}
                                <div className='flex flex-row gap-2'>
                                    <div className='relative border-2 border-primary h-10 w-10 rounded-full flex items-center justify-center text-primary text-sm'>
                                        <FontAwesomeIcon icon={faChalkboardTeacher}/>
                                        <p className='absolute w-auto bottom-10 z-10 bg-tertiary text-white p-2 rounded-md text-xs scale-0 font-text group-hover:scale-100'>Assign Course Admin</p>
                                    </div>
                                    <div className='relative border-2 border-primary h-10 w-10 rounded-full flex items-center justify-center text-primary text-sm'>
                                        <FontAwesomeIcon icon={faPenToSquare}/>
                                        <p className='absolute w-auto bottom-10 z-10 bg-tertiary text-white p-2 rounded-md text-xs scale-0 font-text group-hover:scale-100'>Edit</p>
                                    </div>
                                    <div className='relative border-2 border-primary h-10 w-10 rounded-full flex items-center justify-center text-primary text-sm'>
                                        <FontAwesomeIcon icon={faTrash}/>
                                        <p className='absolute w-auto bottom-10 z-10 bg-tertiary text-white p-2 rounded-md text-xs scale-0 font-text group-hover:scale-100'>Delete</p>
                                    </div>
                                </div>
                            </div>
                            {/* Course Details */}
                            <div className='text-sm text-tertiary grid grid-cols-2 space-y-0.5'>
                                <span className='font-header flex flex-row gap-2'>Date-Added: <p className='font-text'>Loading...</p></span>
                                <span className='font-header flex flex-row gap-2'>Training Type: <p className='font-text'>Loading...</p></span>
                            </div>
                        </div>
                    </div>
            ))}
        </>
    )
}

export default CourseCardLoading;
