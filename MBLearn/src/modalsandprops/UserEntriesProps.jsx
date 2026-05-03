import { faArrowRotateLeft, faCheckSquare, faTrash, faUserPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStateContext } from "../contexts/ContextProvider";
import { faSquare } from "@fortawesome/free-regular-svg-icons";


const UserEntriesProps = ({users,permission, edit, deleteUser, restore ,profileCard, status, handleSelect, selected}) => {
    const {user} = useStateContext();
    const isSelected = selected?.some((item) => item.id === users.id);


    return(
        <tr className="hover:bg-gray-50 border-b cursor-pointer transition-all ease-in-out" onClick={()=>{profileCard()}}>
            <td className={`text-sm py-3 px-4`}>
                <div className="flex items-center gap-3 flex-row">
                    <div className="w-fit cursor-pointer" onClick={(e)=>{e.stopPropagation(); handleSelect()}}>
                        {
                            isSelected ?
                            <FontAwesomeIcon icon={faCheckSquare} className="text-primary text-lg"/>
                            :
                            <FontAwesomeIcon icon={faSquare} className="text-unactive text-lg"/>
                        }

                    </div>
                    <div className="flex flex-row gap-4 items-center">
                        {
                            users.profile_image !== null ?
                            <div className="w-10 h-10 bg-primary rounded-full overflow-hidden">
                                <img src={users.profile_image} alt="" className="w-full h-full object-cover"/>
                            </div> :
                            <div className="w-10 h-10 bg-primary rounded-full overflow-hidden"/>
                        }
                    </div>
                    <div>
                        <p className="font-text">{`${users.first_name} ${users.middle_name ? users.middle_name.charAt(0) + '.' : ''} ${users.last_name}` || "No Name Given"}</p>
                        <p className="text-unactive text-xs font-text">ID: {users.employeeID}</p>
                    </div>
                </div>
            </td>
            <td className="font-text py-3 px-4">
                <p className="text-unactive text-xs">{users.title?.department?.division?.division_name ?? "No Division"}</p>
            </td>
            <td className="font-text py-3 px-4">
                <p className="text-unactive text-xs">{users.title?.department?.department_name ?? " No Department"}</p>
            </td>
            <td className="font-text py-3 px-4">
                <p className="text-unactive text-xs">{users.title?.title_name ?? "No Title"}</p>
            </td>
            <td className="font-text py-3 px-4">
                <div className="flex flex-row gap-1 justify-end">
                    {
                        status === "Active" ?
                        <>
                            {
                            //permission.includes('Edit User') &&
                                user.user_infos.permissions?.some((permission)=> permission.id === 2) ?
                                <button onClick={(e) => edit(e,users)}
                                    className='flex justify-center items-center aspect-square h-10 w-10 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white'>
                                        <FontAwesomeIcon icon={faUserPen}/>
                                    </button>
                                : null
                            }
                            {
                                //permission.includes('Delete User') &&
                                user.user_infos.permissions?.some((permission)=> permission.id === 3) ?
                                <button onClick={(e) => deleteUser(e,users)}
                                    className='flex justify-center items-center aspect-square h-10 w-10 bg-white shadow-md border border-red-600 rounded-md text-red-600 hover:bg-red-600 cursor-pointer transition-all ease-in-out hover:text-white'>
                                        <FontAwesomeIcon icon={faTrash}/>
                                    </button>
                                : null
                            }
                        </>
                        : <>
                            {
                                user.user_infos.permissions?.some((permission)=> permission.id === 6) ?
                                <button onClick={(e) => restore(e,users)}
                                className='flex justify-center items-center aspect-square h-10 w-10 bg-white shadow-md border border-primary rounded-md text-primary hover:bg-primary cursor-pointer transition-all ease-in-out hover:text-white'>
                                    <FontAwesomeIcon icon={faArrowRotateLeft}/>
                                </button>
                                : null
                            }
                            <button onClick={(e) => deleteUser(e,users)}
                                className='flex justify-center items-center aspect-square h-10 w-10 bg-red-700 shadow-md border border-white rounded-md text-white cursor-pointer transition-all ease-in-out hover:text-white'>
                                    <FontAwesomeIcon icon={faTrash}/>
                            </button>
                        </>

                    }
                </div>
            </td>
        </tr>
    )
}

export default UserEntriesProps
