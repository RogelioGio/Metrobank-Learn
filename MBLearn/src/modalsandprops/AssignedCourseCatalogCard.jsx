import { Card, Progress, Text, RingProgress} from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const AssignedCourseCatalogCard = ({name, courseType, courseCategory, trainingType, trainingMode, id, courseId, tab, adder, role, selfEnroll, enrolled, ongoing, due_soon, selected}) => {
    const navigate = useNavigate();

    return(
        <div className='bg-white text-white rounded-md shadow-md hover:scale-105 hover:cursor-pointer transition-all ease-in-out grid grid-rows-[min-content_1fr_min-content]' onClick={() => {role ? selfEnroll() : navigate(`/courseadmin/course/${id}`), selected()}}>
            {/* Course Thumbnail */}
            <div className="flex flex-row justify-end bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-md p-4 gap-2">
                <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text">Published</span>
                <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text">{trainingType}</span>
            </div>
            <div className='px-4 flex flex-col row-span-1'>
                <div className='pt-2'>
                    <h1 className='font-header text-sm text-primary'>{name} <span className='font-text text-unactive text-xs'>-{courseId}</span></h1>
                    <p className='font-text text-primary text-xs'>{courseType} - {courseCategory}</p>
                </div>

            </div>
            {
                tab === "allCourses" ? (
                    <div className='grid grid-cols-[1fr_min-content_1fr] gap-2 px-4 pt-2 pb-4'>
                        <div className="flex flex-col items-start font-text justify-between gap-2">
                            <p className="text-xs text-unactive">Course Contributor:</p>
                            <div>
                                <p className='text-xs font-text text-primary'>{adder?.first_name} {adder?.middle_name}  {adder?.last_name} {adder?.name_suffix} </p>
                                <p className='text-xs font-text text-unactive'> ID: {adder?.employeeID} </p>
                            </div>
                        </div>
                            <div className="w-[1px] h-full bg-divider"/>
                            <div className="flex flex-col items-start font-text justify-between gap-2">
                            <p className="text-xs text-unactive">Course Author:</p>
                            <div>
                                <p className='text-xs font-text text-primary'>Author's Name</p>
                                <p className='text-xs font-text text-unactive'> ID: 122001231</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='grid grid-cols-[1fr_min-content_1fr_min-content_1fr] gap-2 p-4'>
                    <div className="flex flex-row items-center font-text justify-between">
                        <p className="text-xs text-unactive">Enrolled</p>
                        <p className="font-header text-primary">{enrolled || 0}</p>
                    </div>
                    <div className="w-[1px] h-full bg-divider"/>
                    <div className="flex flex-row items-center font-text justify-between">
                        <p className="text-xs text-unactive">On-going</p>
                        <p className="font-header text-primary">{ongoing || 0}</p>
                    </div>
                    <div className="w-[1px] h-full bg-divider"/>
                    <div className="flex flex-row items-center font-text justify-between">
                        <p className="text-xs text-unactive">Due Soon</p>
                        <p className="font-header text-primary">{due_soon || 0}</p>
                    </div>
                </div>
                )
            }
        </div>
    )
}
export default AssignedCourseCatalogCard
