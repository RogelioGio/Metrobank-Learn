import { faFileExport, faTrashCan, faUserPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useOption } from "../contexts/AddUserOptionProvider";
import { useEffect, useState } from "react";
import ReportGenerationModal from "./ReportGenerationModal";
import ReportGeneratedModal from "./ReportGeneratedModal";
import { useStateContext } from "../contexts/ContextProvider";

const UserSecEntyProps = ({users,name,employeeID,MBEmail,city,branch,division,section,department,role,image,status,lastLogin,edit,select}) => {
    const [success, setSuccess] = useState(false);
    const {user} = useStateContext();
    const [breakpoint, setBreakpoint] = useState();
    const [openReportGeneration, setOpenReportGeneration] = useState(false);
    const [generated, setGenerated] = useState(false);
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

    return (
        <>
            <tr className='font-text text-sm hover:bg-gray-200' >
            {
                breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md' ? (<>
                    <td className="py-3 px-4 grid grid-cols-[min-content_1fr_1fr] grid-rows-2 gap-y-2 gap-x-3">
                        <div className="h-10 w-10 row-span-2">
                                    <img alt="" src={image} className='rounded-full w-full'/>
                        </div>
                        <div>
                            <p className='font-text'>{name}</p>
                            <p className='text-unactive text-xs'>ID: {employeeID}</p>
                        </div>
                        <div>
                            <p className="">{MBEmail}</p>
                            <p className='text-xs font-text text-unactive'>Email</p>
                        </div>
                        <div>
                            <p className="">{role}</p>
                            <p className='text-xs font-text text-unactive'>Account Role</p>
                        </div>
                        <div>
                            <p className="">{lastLogin != null ? lastLogin : "Not Logged Yet"}</p>
                            <p className='text-xs font-text text-unactive'>Last-Logged-in Time Stamp</p>
                        </div>
                    </td>
                </>) : (
                    <>
                    <td className='text-sm py-3 px-4'>
                            <div className='flex items-center gap-2'>
                                {/* User Image */}
                                <div className='bg-blue-500 h-10 w-10 rounded-full'>
                                    <img alt="" src={image} className='rounded-full'/>
                                </div>
                                {/* Name */}
                                <div>
                                    <p className='font-text'>{name}</p>
                                    <p className='text-unactive'>ID: {employeeID}</p>
                                </div>
                            </div>
                        </td>

                        <td className='py-3 px-4'>
                            <p className="text-unactive">{MBEmail}</p>
                        </td>

                        <td className='py-3 px-4'>
                            <p className="text-unactive">{role}</p>
                        </td>

                        {/* Last Login */}
                        <td className="py-3 px-4">
                        <p className="text-unactive">{lastLogin != null ? lastLogin : "Not Logged Yet"}</p>
                        </td>

                        {/* Action */}
                        {/* ${isLoading ? "scale-0" : "scale-0 group-hover:scale-100"} */}
                        <td className="py-3 px-4">
                            <div className="flex items-center justify-end relative gap-x-1">
                                {
                                    user.user_infos.permissions?.some((permission)=> permission.id === 4) ?
                                    <div className="group relative">
                                        <div className="border border-primary rounded-md min-h-10 min-w-10 w-10 h-10 flex items-center justify-center gap-2 text-primary text-base hover:bg-primaryhover hover:text-white cursor-pointer transition-all ease-in-out"
                                            onClick={(e) => edit(e,users,select)}>
                                            <FontAwesomeIcon icon={faUserPen} />
                                        </div>
                                        <div className={`absolute w-fit bottom-[-2.3rem] -right-1 bg-tertiary rounded-md text-white font-text text-xs p-2 items-center justify-center whitespace-nowrap block transition-all ease-in-out
                                            scale-0 group-hover:scale-100 z-50`}>
                                        <p>Edit User</p>
                                        </div>
                                    </div> : null
                                }
                                {
                                    user.user_infos.permissions?.some((permission)=> permission.id === 11) ?
                                    <div className="group relative">
                                        <div className="border border-primary rounded-md min-h-10 min-w-10 w-10 h-10 flex items-center justify-center gap-2 text-primary text-base hover:bg-primaryhover hover:text-white cursor-pointer transition-all ease-in-out"
                                            onClick={() => setOpenReportGeneration(true)}>
                                            <FontAwesomeIcon icon={faFileExport} />
                                        </div>
                                        <div className={`absolute w-fit bottom-[-2.3rem] -right-1 bg-tertiary rounded-md text-white font-text text-xs p-2 items-center justify-center whitespace-nowrap block transition-all ease-in-out
                                            scale-0 group-hover:scale-100 z-50`}>
                                        <p>Export User Activity Logs</p>
                                        </div>
                                    </div> : null
                                }
                            </div>
                        </td>
                    </>
                )
            }
        </tr>
        <ReportGenerationModal open={openReportGeneration} close={()=>setOpenReportGeneration(false)} usedFor={"userLogs"} generated={()=>setGenerated(true)} userToReport={select} setSuccess={()=>setSuccess(true)}/>
        <ReportGeneratedModal open={generated} close={()=>{setGenerated(false); setTimeout(() => setSuccess(false), 5000)}} type={success}/>
        </>
    );
}
export default UserSecEntyProps;
