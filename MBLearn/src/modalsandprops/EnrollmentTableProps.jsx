const EnrollmentTableProps = ({children, selectAll, all, course}) => {
    return (
        <div className="row-start-2 col-span-4">
            <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
            <table className='text-left min-w-full table-auto table-layout-fixed'>
                <thead className='font-header text-xs text-primary bg-secondaryprimary'>
                    <tr>
                        <th className='p-4 w-2/7'>
                            <div className="flex items-center flex-row gap-4">
                            {/* Checkbox */}
                            <div className="group grid size-4 grid-cols-1">
                                <input type="checkbox"
                                    className="col-start-1 row-start-1 appearance-none border border-primary rounded checked:border-primary checked:bg-primary indeterminate:bg-primary focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1"
                                    ref={selectAll}
                                    onClick={all}
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
                            <p>EMPLOYEE NAME</p>
                            </div>
                        </th>
                        <th className='p-4 hidden md:table-cell'>DIVISION</th>
                        <th className='p-4 hidden md:table-cell'>DEPARTMENT</th>
                        <th className='p-4 hidden md:table-cell'>SECTION</th>
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-divider'>
                    {/* <tr>
                        <td colSpan="5">
                            <div className="p-5 text-center font-text text-unactive">
                                <p>Please choose a course to select employee to enroll</p>
                            </div>
                        </td>
                    </tr> */}
                    {children}
                </tbody>
            </table>
            </div>
        </div>
    )
}
export default EnrollmentTableProps;
