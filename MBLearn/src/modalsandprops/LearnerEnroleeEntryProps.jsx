import { useEffect } from "react";

const Learner = ({learner, enrollmentList, currentCourse,handleCheckbox}) => {

    const course = enrollmentList.find(entry => entry.course.id === currentCourse?.id);
    const checked = course?.enrollees?.some(enrollee => enrollee.id === learner?.id) ?? false;

    useEffect(() => {
        console.log(learner);
    }, [learner]);

    return(
        <tr className={`font-text text-sm hover:bg-gray-200 cursor-pointer ${checked ? 'bg-gray-200':''}`} onClick={handleCheckbox}>

                {/* Employee Name */}
                <td className={`font-header px-4 py-3 flex flex-row items-center gap-3 border-l-2 border-transparent transition-all ease-in-out ${checked ? '!border-primary':''} h-full`}>
                    <div className="hidden md:flex flex-row items-center gap-3 w-full">
                        {/* Checkbox */}
                        <div className="group grid size-4 grid-cols-1 min-h-4 min-w-4">
                            <input type="checkbox"
                                className="col-start-1 row-start-1 appearance-none border border-divider rounded checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1"
                                name={learner?.id}
                                id={learner?.id}
                                checked={checked}
                                onChange={handleCheckbox}
                            />
                            {/* Custom Checkbox styling */}
                            <svg fill="none" viewBox="0 0 14 14" className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25">
                                {/* Checked */}
                                <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-[:checked]:opacity-100"
                                />
                                {/* Indeterminate */}
                                <path
                                    d="M3 7H11"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                    />
                            </svg>
                        </div>

                        <div className="min-w-8 min-h-8 rounded-full bg-blue-500 w-8 h-8">
                            <img src={learner?.profile_image} alt="" className="w-8 rounded-full"/>
                        </div>

                        <div>
                        <p className={`font-text text-sm`}>{learner?.first_name} {learner?.middle_name || ""} {learner?.last_name}</p>
                        <p className="font-text text-unactive text-xs">ID: {learner?.employeeID}</p>
                        </div>
                    </div>
                    <div className="md:hidden grid grid-cols-[min-content_1fr_1fr_1fr] gap-2 w-full">
                        {/* Checkbox */}
                        <div className="flex items-center justify-center">
                            <div className="group grid size-4 grid-cols-1 min-h-4 min-w-4">
                                <input type="checkbox"
                                    className="col-start-1 row-start-1 appearance-none border border-divider rounded checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1"
                                    name={learner?.id}
                                    id={learner?.id}
                                    checked={checked}
                                    onChange={handleCheckbox}
                                />
                                {/* Custom Checkbox styling */}
                                <svg fill="none" viewBox="0 0 14 14" className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25">
                                    {/* Checked */}
                                    <path
                                        d="M3 8L6 11L11 3.5"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="opacity-0 group-has-[:checked]:opacity-100"
                                    />
                                    {/* Indeterminate */}
                                    <path
                                        d="M3 7H11"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                        />
                                </svg>
                            </div>
                        </div>

                        <div className="col-span-3 row-start-1 col-start-2 flex flex-row gap-4 pl-2 items-center">
                            <div className="min-w-8 min-h-8 rounded-full bg-blue-500 w-8 h-8 flex items-center justify-center">
                                <img src={learner?.profile_image} alt="" className="w-8 rounded-full"/>
                            </div>

                            <div>
                            <p className={`font-text text-sm`}>{learner?.first_name} {learner?.middle_name || ""} {learner?.last_name}</p>
                            <p className="font-text text-unactive text-xs">ID: {learner?.employeeID}</p>
                            </div>
                        </div>

                        <div className="col-start-2 font-text ">
                            <p className="text-xs"> {learner?.division?.division_name}</p>
                            <p className="text-xs text-unactive"> Division</p>
                        </div>
                        <div className="col-start-3 font-text ">
                            <p className="text-xs"> {learner?.department?.department_name} </p>
                            <p className="text-xs text-unactive"> Department</p>
                        </div>
                        <div className="col-start-4 font-text ">
                            <p className="text-xs"> {learner?.section?.section_name} </p>
                            <p className="text-xs text-unactive"> Section</p>
                        </div>
                    </div>
                </td>

                {/* Division */}
                <td className="p-4 font-text text-unactive md:table-cell hidden">
                    <p className="text-xs"> {learner?.division?.division_name}</p>
                </td>

                {/* Department */}
                <td className="p-4 font-text text-unactive md:table-cell hidden">
                    <p className="text-xs"> {learner?.department?.department_name} </p>
                </td>

                {/* Section*/}
                <td className="p-4 font-text text-unactive md:table-cell hidden">
                    <p className="text-xs"> {learner?.section?.section_name} </p>
                </td>

            </tr>

    )
}

export default  Learner
