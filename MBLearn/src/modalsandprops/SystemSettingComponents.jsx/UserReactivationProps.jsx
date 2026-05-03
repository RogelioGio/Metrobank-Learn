import { format } from "date-fns"
import { useOption } from "MBLearn/src/contexts/AddUserOptionProvider"


const UserReactivationProps = ({id,image, name, MBEmail, branch, city, _division,_section,_department,login_time_stamp,selected}) => {
    const {cities,departments,location,titles,roles,division,section} = useOption()

    return(
        <tr className='font-text text-sm hover:bg-gray-200 hover:cursor-pointer' onClick={()=>selected(id)}>
            <td className='text-sm py-3 px-4'>
                <div className='items-center gap-2 md:flex hidden'>
                    {/* User Image */}
                    <div className='bg-blue-500 h-10 w-10 rounded-full'>
                        <img alt="" src={image} className='rounded-full'/>
                    </div>
                    {/* Name */}
                    <div>
                        <p className='font-text'>{name}</p>
                        <p className='text-unactive'>{MBEmail}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 grid-rows-[min-content_1fr] md:hidden">
                    <div className="cols-span-2 flex w-full items-center gap-2 pb-3">
                        <img alt="" src={image} className='rounded-full w-10 h-10'/>
                        <div>
                            <p className='font-text'>{name}</p>
                            <p className='text-unactive'>{MBEmail}</p>
                        </div>
                    </div>
                    <div className="col-start-3 flex flex-col items-end gap-1">
                        <p className="text-xs text-unactive">Last Log-in Timestamp</p>
                        <p>{
                            login_time_stamp && new Date(login_time_stamp).getTime() !== 0
                            ? format(new Date(login_time_stamp), 'MMMM dd yyyy')
                            : "Not logged in yet"
                        }</p>

                    </div>
                    <div className="row-start-2 text-xs flex flex-col justify-end gap-1">
                        <p>{division?.find(d => d.id === _division)?.division_name}</p>
                        <p className="text-unactive">Division</p>
                    </div>
                    <div className="row-start-2 text-xs flex flex-col justify-end gap-1">
                        <p>{departments?.find(d => d.id === _department)?.department_name}</p>
                        <p className="text-unactive">Department</p>
                    </div>
                    <div className="row-start-2 text-xs flex flex-col justify-end gap-1">
                        <p>{section?.find(s => s.id === _section)?.section_name}</p>
                        <p className="text-unactive">Section</p>
                    </div>
                </div>
            </td>
            <td className='py-3 px-4 md:table-cell hidden'>
                <div className='flex flex-col'>
                    {/* Branch Location */}
                    <p className='text-unactive'>{location?.find(l => l.id === branch).branch_name}</p>
                    {/* City Location */}
                    <p className='text-unactive text-xs'>{cities?.find(c => c.id === city)?.city_name}</p>
                </div>
            </td>
            <td className='py-3 px-4 md:table-cell hidden'>
                    {/* Division */}
                    <p className='text-unactive'>{division?.find(d => d.id === _division)?.division_name}</p>
                    {/* Section */}
                    <p className='text-unactive'>{section?.find(s => s.id === _section)?.section_name}</p>
            </td>
        </tr>
    )
}
export default UserReactivationProps
