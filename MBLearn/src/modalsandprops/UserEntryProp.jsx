import { faChevronLeft, faChevronRight, faEllipsis, faTrashCan, faUserPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../contexts/ContextProvider'

const User = ({re_move,click,userID,name,department,title,branch,city,profile_url,employeeID,role,edit,_delete,handleCheckbox,selected,isChecked,userDetail,division,section,selectedUser,Entry}) => {
    const selectedUsers = selected.some(
        (user) => user.Selected_ID === userID
    )

    const {user} = useStateContext();

    const [breakpoint, setBreakpoint] = useState();
    const [viewport, setViewport] = useState({
            width: window.innerWidth,
            height: window.innerHeight,
        });
         useEffect(() => {
            const handleResize = () => {
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
         }, []);

        useEffect(() => {
        const { width } = viewport;

        if (width < 640) {
            setBreakpoint('base');
        } else if (width >= 640 && width < 768) {
            setBreakpoint('sm');
        } else if (width >= 768 && width < 1024) {
            setBreakpoint('md');
        } else if (width >= 1024 && width < 1280) {
            setBreakpoint('lg');
        } else if (width >= 1280 && width < 1536) {
            setBreakpoint('xl');
        } else {
            setBreakpoint('2xl');
        }

    }, [viewport]);



    return(
        <tr>

        {/* <tr className={`font-text text-sm hover:bg-gray-200 ${selectedUsers? 'bg-gray-200':''}`} onClick={() => click()}> */}
            {
                breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md'? (<>
                    <td className={`text-sm py-3 px-4 border-l-2 border-transparent transition-all ease-in-out ${selectedUsers? '!border-primary':''}`}>
                        <div className='items-center gap-2 grid grid-cols-[min-content_auto_auto_auto] grid-rows-2'>
                            {/* Checkbox */}
                            <div className="group grid w-4 h-4 grid-cols-1">
                                <input type="checkbox"
                                    className="w-4 h-4 col-start-1 row-start-1 appearance-none border border-divider rounded checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                        handleCheckbox(e, userID);
                                    }}
                                    checked={isChecked} // Updated this line
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
                            <div className='flex flex-row gap-4 items-center col-span-2'>
                                {/* User Image */}
                                {
                                    profile_url ? <img src={profile_url} alt="" className='rounded-full h-10 w-10'/>
                                    : <div className='bg-blue-500 h-10 w-10 rounded-full'></div>
                                }

                                {/* Name and employee-id*/}
                                <div>
                                    <p className='font-text whitespace-nowrap'>{name}</p>
                                    <p className='text-unactive text-xs'>ID: {employeeID}</p>
                                </div>
                            </div>
                            <div className='flex gap-1 justify-end'>
                            {/* <button className='text-primary border border-primary rounded-md px-3 py-2 bg-white hover:bg-primary hover:text-white transition-all ease-in-out'
                                onClick={(e) => userDetail(e, userID)}>
                                <FontAwesomeIcon icon={faEllipsis}/>
                            </button> */}
                            {
                                user.user_infos.permissions?.some((permission)=> permission.permission_name ===  "EditUserInfo")? (
                                    <button onClick={(e) => edit(e,userID)}
                                    className='flex justify-center items-center aspect-square h-10 w-10 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white'>
                                        <FontAwesomeIcon icon={faUserPen}/>
                                    </button>
                                ):(null)
                            }
                            {
                                user.user_infos.permissions?.some((permission)=> permission.permission_name ===  "DeleteUserInfo")  ? (
                                    <button onClick={(e) => _delete(e,userID)}
                                    className='inline-flex justify-center items-center aspect-square h-10 w-10 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white'>
                                        <FontAwesomeIcon icon={faTrashCan}/>
                                    </button>

                                ) : (null)
                            }
                            </div>

                            <div className='col-start-2 flex flex-col justify-start'>
                                <p className='text-black text-xs'>{division}</p>
                                <p className='text-xs font-text text-unactive'>Division</p>
                            </div>
                            <div className='col-start-3 flex flex-col justify-start'>
                                <p className='text-black text-xs '>{department}</p>
                                <p className='text-xs font-text text-unactive'>Department</p>
                            </div>
                            <div className='col-start-4 flex flex-col justify-start'>
                                <p className='text-black text-xs'>{section}</p>
                                <p className='text-xs font-text text-unactive'>Section</p>
                            </div>
                        </div>
                    </td>
                </>)
                :
                (
                    <>
                    <td className={`text-sm  py-3 px-4 border-l-2 border-transparent transition-all ease-in-out ${selectedUsers? '!border-primary':''}`}>
                        <div className='flex items-center gap-3 flex-row '>
                            {/* Checkbox */}
                            <div className="group grid w-4 h-4 grid-cols-1">
                                <input type="checkbox"
                                    className="w-4 h-4 col-start-1 row-start-1 appearance-none border border-divider rounded checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                        handleCheckbox(e, userID);
                                    }}
                                    checked={isChecked} // Updated this line
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
                            <div className='flex flex-row gap-4 items-center'>
                                {/* User Image */}
                                    {
                                        profile_url ? <img src={profile_url} alt="" className='rounded-full h-10 w-10'/>
                                        : <div className='bg-blue-500 h-10 w-10 rounded-full'></div>
                                    }

                                {/* Name and employee-id*/}
                                <div>
                                    <p className='font-text'>{name}</p>
                                    <p className='text-unactive text-xs'>ID: {employeeID}</p>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className='py-3 px-4'>
                        <p className='text-unactive'>{Entry.title.title_name}</p>
                    </td>
                    <td className='py-3 px-4'>
                        <div className='flex flex-col'>
                            {/* Department */}
                            <p className='text-unactive'>{department}</p>
                        </div>
                    </td>
                    <td className='py-3 px-4'>
                        <p className='text-unactive'>{section}</p>
                    </td>
                    {/* <td className='py-3 px-4'>
                        <div className='flex flex-col'> */}
                        {/* Branch Location
                        <p className='text-unactive'>{branch}</p>
                        City Location
                        <p className='text-unactive text-xs'>{city}</p>
                        </div>
                    </td> */}

                    {/* Action */}
                    <td className='py-3 px-4'>
                        <div className='flex gap-1 justify-end'>

                        {/* <button className='text-primary border border-primary rounded-md px-3 py-2 bg-white hover:bg-primary hover:text-white transition-all ease-in-out'
                            onClick={(e) => userDetail(e, userID)}>
                            <FontAwesomeIcon icon={faEllipsis}/>
                        </button> */}

                        {
                            user.user_infos.permissions?.some((permission)=> permission.permission_name ===  "EditUserInfo")? (
                                <button onClick={(e) => edit(e,userID)}
                                className='flex justify-center items-center aspect-square h-10 w-10 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white'>
                                    <FontAwesomeIcon icon={faUserPen}/>
                                </button>
                            ):(null)
                        }
                        {
                            user.user_infos.permissions?.some((permission)=> permission.permission_name ===  "DeleteUserInfo")  ? (
                                <button onClick={(e) => _delete(e,userID)}
                                className='inline-flex justify-center items-center aspect-square h-10 w-10 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white'>
                                    <FontAwesomeIcon icon={faTrashCan}/>
                                </button>

                            ) : (null)
                        }



                        </div>
                    </td>
                    </>
                )
            }


        </tr>
    )
}

export default User
