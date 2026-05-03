const AssignedCourseEnrollmentCard = ({selected, onclick, AssignedCourse, numberOfEnrollees,learnerLoading}) => {
    //const enrollees = numberOfEnrollees(id)
    return(
        <div className={`grid gap-1 grid-cols-[1fr_min-content] grid-rows-[min-content_1fr] border border-primary rounded-md py-2 px-4 shadow-md w-full transition-all ease-in-out ${learnerLoading ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer hover:bg-primaryhover hover:text-white "} ${selected.name === AssignedCourse?.name ? 'bg-primary text-white' : 'bg-white text-primary'}`}
            onClick={onclick}>
            <div className="row-start-1 col-start-2 -span-2 flex items-center justify-center gap-2
                            md:row-span-2">
                {
                    numberOfEnrollees === 0 ? null :
                    <div className={`min-h-5 min-w-5 h-6 md:h-8 w-6 md:w-8 rounded-full flex items-center justify-center font-text text-xs ${selected.name === AssignedCourse?.name ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        <p>{numberOfEnrollees}</p>
                    </div>
                }
            </div>
            <div className="flex items-end row-start-1 col-start-1">
                <div>
                    <span className="font-text inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                        {AssignedCourse.training_type }
                    </span>
                </div>
            </div>
            <div className="row-start-2 col-span-2
                            md:col-span-1">
                <div>
                    <h1 className="font-header text-sm">{AssignedCourse?.name}</h1>
                    <h1 className="font-text text-xs">Course ID: {AssignedCourse?.CourseID}</h1>
                </div>
            </div>
        </div>
    )
}
export default AssignedCourseEnrollmentCard;
