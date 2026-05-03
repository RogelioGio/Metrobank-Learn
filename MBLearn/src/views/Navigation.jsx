import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faBell, faBook, faBookBookmark, faBookOpen, faBookOpenReader, faChalkboard, faChartGantt, faChartPie, faEllipsis, faEllipsisVertical, faGear, faGears, faGraduationCap, faHouse, faMedal, faMobileButton, faPencil, faPersonCirclePlus, faRightFromBracket, faUser, faUserGraduate, faUserGroup, faUserLock, faUserShield, faUsersRays, } from '@fortawesome/free-solid-svg-icons'
import Small_Logo from '../assets/Small_Logo.svg'
import axiosClient from '../axios-client';
import { useEffect, useRef, useState } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import { Link, Links, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { use } from 'react';
import { toast } from 'sonner';
import NotificationModal from '../modalsandprops/NotificationModal';
import fullLogo from "../assets/Full_Logo.svg";
import PortalToolTip from '../components/ui/portal';
import { Portal } from 'vaul';
import { CustomPopover} from '../components/ui/mypopover';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, SheetOverlay, SheetPortal} from '../components/ui/sheet';
import AddPhoneNumber from '../modalsandprops/AddPhoneNumber';
import { MBLearnEcho } from 'MBLearn/MBLearnEcho';



//Icon props
const Icons = ({icon, text, to, notification, unread}) => (
    notification ?
    <div className='_icon'>
        <div className='icon group'>
            <div className='hover:scale-105 transition-all ease-in-out grid grid-cols-1 place-items-center relative'>
                {
                    unread &&
                    <div className='text-xs font-text bg-primary w-2 h-2 rounded-full mt-[-0.5rem] mr-[-1rem]'></div>
                }
                {icon}
            </div>
            <p className='icon-name group-hover:scale-100'>{text}</p>
        </div>
    </div>
    :
    <NavLink to={to} className={({isActive}) => isActive ? 'icon_active':'_icon'}>
        <div className='icon group'>
            <p className='hover:scale-105 transition-all ease-in-out'>{icon}</p>
            <p className='icon-name group-hover:scale-100'>{text}</p>
        </div>
    </NavLink>

)


//Profile props
const ProfileIcons = ({text ,icon, onClick}) => (
    <div className='profile-menu-item py-2 px-2' onClick={onClick}>
        <p className='text-xs'>{text}</p>
        <p className='text-xl'>{icon}</p>
    </div>
)

//Role-based Navigations
const navItems = {
    "System Admin": [
        {icon:faHouse, text:"Home", to:'/systemadmin/dashboard'},
        {icon:faUserGroup, text:"User Management Maintenance", to:"/systemadmin/usermanagementmaintenance"},
        {icon:faUserLock, text:"System Access Maintenance", to:"/systemadmin/useraccountsmaintenance"},
        {icon:faGears, text:"System Configuration Maintenance", to:"/systemadmin/systemconfigurationmaintenance"},
        //{icon:faChartPie, text:"System-Level Reports", to:"/systemadmin/systemlevelreports"},
        //{icon:faChartGantt, text:"Activity Logs", to:"/systemadmin/activitylogs"},
    ],
    "Course Admin": [
        {icon:faHouse, text:"Home", to:"/courseadmin/dashboard"},
        {icon:faChalkboard, text:"Course Manager", to:"/courseadmin/courses"},
        {icon:faUserGraduate, text:"Learners", to:"/courseadmin/learnersprofile"},
        // {icon:faPersonCirclePlus, text:"Enroll Trainee", to:"/courseadmin/bulkenrollment"},
        // {icon:faChartPie, text:"Assigned Course Reports", to:"/courseadmin/coursereports"},
        // {icon:faUsersRays, text:"My Employees", to:"/courseadmin/myemployee"}
    ],
    "Learner": [
        {icon:faHouse, text:"Home", to:"/learner/dashboard"},
        {icon:faBook, text:"Courses Manager", to:"/learner/learnercoursemanager/#"},
        {icon:faMedal, text:"Certificates" , to:"/learner/learnercertificates"},
        //{icon:faGraduationCap, text:"Self Enrollment", to:"/learner/learnerselfenrollment"},
    ]
}

export default function Navigation({unread_notfications, size, setLoading}) {
    const {user, token, profile_image, role, availableRoles, setAvailableRoles,setUser, setToken, setRole, setAuthenticated, unread} = useStateContext();
    const navigate = useNavigate();
    const [openNotficiation, setOpenNotification] = useState(false);
    //const [unread, setUnread] = useState(unread_notfications); // Default to false if not provided
    const [hover, setHover] = useState(false);
    const [openSavePhone, setOpenSavePhone] = useState(false);
    const [notificationList, setNotificationList] = useState(unread_notfications);

    useEffect(() => {
         if(token){
            window.Echo = MBLearnEcho(token);
            const channelName = `App.Models.UserCredentials.${user?.id}`;
            const channel = window.Echo.private(channelName);

            channel.notification((notification) => {
                setNotificationList(true)
            });
        }
    }),[user]

    const Logout = () => {
        toast("Logging Out....",{
            description: "User account is logging out the system",
        }
        )
    }

    const OpenProfile = (e) => {
        e.stopPropagation()
        const roleName = user?.user_infos?.roles?.[0]?.role_name?.replace(/\s+/g, '').toLowerCase(); // Remove spaces
        //navigate(`/${roleName}/userdetail/${user?.user_infos?.id}`);
        navigate(`/${roleName}/profile`);
    }


    useEffect(() => {
        let roles = []
        if(user?.user_infos?.roles[0]?.role_name === 'System Admin'){
            roles = ['System Admin', 'Course Admin', 'Learner']
        }else if(user?.user_infos?.roles[0]?.role_name === 'Course Admin'){
            roles = ['Course Admin', 'Learner']
        };
        setAvailableRoles(roles);
    }, [role]);

    //Dynamic Role Switching Array
    const getSelection = (role) => {
        switch(role){
            case "System Admin": return faUserShield;
            case "Course Admin": return faBookOpenReader;
            case "Learner": return faGraduationCap;
            default: return faUser;
        }
    };
    const rolesSwitch = availableRoles.reduce((acc, index)=>{
        acc[index] = availableRoles.filter(r => r !== index)
        .map((r) => ({
            text: `Be a ${r}`,
            icon: <FontAwesomeIcon icon={getSelection(r)} />,
            onclick: () => handleRoleSwtiching(r),
        }));
        return acc;
    },{})



    //Role Switching
    const handleRoleSwtiching = (newRole) => {
        setLoading(true);
        setRole(newRole);
        setTimeout(()=>{
            navigate(`/${newRole.toLowerCase().replace(" ","")}/dashboard`);
            setLoading(false);
        },2000)

    };

    //Role-based Navigation
    const Items = navItems[role] || [];


    // const onLogout = async () => {
    //     try{
    //         Logout()
    //         await axiosClient.post('/logout');
    //         setRole('');
    //         setUser('');
    //         setToken(null);
    //         toast("Log Out Successfully.",{
    //             description: "User account is logged out the system",
    //         })
    //     }catch (e){
    //         console.error(e);
    //     }

    const onLogout = () => {
        Logout();
        axiosClient.post('/logout')
            .then(() => {
                setRole('');
                setUser('');
                setToken(null);
                navigate('/login');
                toast("Log Out Successfully.", {
                    description: "User account is logged out of the system",
                });
            })
            .catch((error) => {
                console.error(error);
                toast.error("Failed to log out. Please try again.");
            });
    }

    return (
        <>
        {
            size === 'sm' || size === 'base'?
            <Sheet>
                <SheetTrigger>
                    <div className='bg-white w-10 h-10 text-primary border-2 border-primary rounded-md flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out'>
                        <FontAwesomeIcon icon={faBars} className='text-lg'/>
                    </div>
                </SheetTrigger>
                <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all z-50"/>
                <SheetContent side='left' className='bg-background backdrop-blur-sm h-'>
                    <div className='py-2 flex flex-col gap-2 justify-between h-full'>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center w-36 aspect-auto pb-5 pl-1'>
                                <img src={fullLogo} alt="" />
                            </div>
                            {
                                Items.map((role, index) => (
                                    <div key={index}>
                                        <NavLink to={role.to} className={({ isActive }) => `${isActive ? 'text-primary bg-primarybg shadow-md' : 'text-unactive'} group py-2 px-4 flex flex-row items-center gap-5 rounded-md hover:bg-primarybg hover:shadow-md transition-all ease-in-out hover:cursor-pointer`}>
                                        <FontAwesomeIcon icon={role.icon}/>
                                        <p className='font-header'>{role.text}</p>
                                        </NavLink>
                                    </div>
                                ))
                            }
                        </div>
                        <div className='flex flex-col gap-2'>
                            <NavLink to={"/systemadmin/accountsettings"} className={({ isActive }) => `${isActive ? 'text-primary bg-primarybg shadow-md' : 'text-unactive'} group py-2 px-4 flex flex-row items-center gap-5 rounded-md hover:bg-primarybg hover:shadow-md transition-all ease-in-out hover:cursor-pointer`}>
                                        <FontAwesomeIcon icon={faGear}/>
                                        <p className='font-header'> AccountSetting</p>
                                    </NavLink>
                            <div className='flex flex-row items-center justify-between'>
                                <div className='flex flex-row gap-3 items-center'>
                                    <div className='w-12 h-12 rounded-full shadow-lg hover:scale-105 transition-all ease-in-out'>
                                        <img src={user.user_infos.profile_image} className='rounded-full'/>
                                    </div>
                                    <div>
                                        <p className='font-header text-primary'>{user.user_infos.first_name} {user.user_infos.middle_name || ""} {user.user_infos.last_name || ""} {user.user_infos.name_suffix || ""} </p>
                                        <p className='font-text text-unactive text-sm'>ID: {user.user_infos.employeeID}</p>
                                    </div>
                                </div>
                                <div>
                                    <div className='group relative'>
                                        <div className='border-2 border-primary rounded w-10 h-10 flex justify-center items-center text-primary hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out' >
                                            <FontAwesomeIcon icon={faEllipsisVertical} className='text-xl'/>
                                        </div>
                                        <div className=' absolute bg-tertiary rounded-md left-11 bottom-0 scale-100 group-hover:scale-100 p-2 hover:scale-100'>
                                            <ul>
                                                {
                                                    rolesSwitch[role]?.map((option, index) => (
                                                        <li key={index}>
                                                            <ProfileIcons text={option.text} icon={option.icon} onClick={option.onclick}/>
                                                        </li>
                                                    ))
                                                }
                                                <ProfileIcons text={"Logout"} icon={<FontAwesomeIcon icon={faRightFromBracket}/>} onClick={onLogout}/>
                                                <li><div className='bg-white h-[1px]'></div></li>
                                        <       ProfileIcons text={"View Profile"} icon={<FontAwesomeIcon icon={faUser}/>} onClick={OpenProfile}/>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            :
            <div className="flex flex-col items-center h-screen w-24 place-content-between py-2 z-10
                        sm:px-2">
            <div className='flex flex-col place-content-between w-23 h-full bg-white py-5 px-2 shadow-lg m-1 border-r rounded-full'>
                <ul className='flex flex-col gap-4 justify-center items-center p-[0.625rem]'>
                    <li><img src={Small_Logo} alt="" className='h-[1.875rem]'/></li>
                    {
                        Items.map((role, index) => (
                            <li key={index}><Icons
                                                    icon={<FontAwesomeIcon icon={role.icon}/>}
                                                    text={role.text}
                                                    to={role.to}/>
                            </li>
                        ))
                    }
                    {
                        user.user_infos.permissions?.some((permission)=> permission.id === 23) && role === "Learner"?
                        <li><Icons
                                icon={<FontAwesomeIcon icon={faGraduationCap}/>}
                                text={"Self Enrollment"}
                                to={"/learner/learnerselfenrollment"}/>
                        </li>: null
                    }
                </ul>
                <ul className='flex flex-col gap-4 justify-center items-center'>
                    {
                        user.user_infos.permissions?.some((permission)=> permission.id === 15) ?
                        rolesSwitch[role]?.map((option, index) => (
                            <li key={index} className='relative group text-lg'>
                                <div className='text-unactive hover:text-primary transition-all ease-in-out hover:cursor-pointer' onClick={option.onclick}>
                                    {option.icon}
                                </div>
                                <div className='absolute bg-tertiary rounded-md left-6 bottom-0 scale-0 group-hover:scale-100 hover:scale-100 p-2 transition-all ease-in-out'>
                                    <p className='font-text text-xs text-white whitespace-nowrap'>{option.text}</p>
                                </div>
                            </li>
                        )) : null
                    }
                    <li onClick={() => navigate(`${role.trim().toLowerCase().replace(/\s+/g, '')}/notifications`)}>
                        <div className='_icon'>
                            <div className='icon group'>
                                <div className='hover:scale-105 transition-all ease-in-out grid grid-cols-1 place-items-center relative'>
                                    {
                                        unread ?
                                        <div className='text-xs font-text bg-primary w-2 h-2 rounded-full mt-[-0.5rem] mr-[-1rem]'></div> : null
                                    }
                                    {<FontAwesomeIcon icon={faBell}/>}
                                </div>
                                <p className='icon-name group-hover:scale-100'>Notifications</p>
                            </div>
                        </div>
                    </li>
                    {/* <li className='_icon' onClick={() => setOpenNotification(true)}>
                        <div>
                            <div className='icon group'>
                                <p className='hover:scale-105 transition-all ease-in-out'><FontAwesomeIcon icon={faBell}/></p>
                                <p className='icon-name group-hover:scale-100'>Notifications</p>
                            </div>
                        </div>
                    </li> */}
                    <li className='relative shrink-0 flex items-center justify-center'>
                        <div
                            onMouseEnter={() => setHover(true)}
                            className="rounded-full w-10 h-10 shadow-md transition-all ease-in-out bg-center bg-cover"
                            style={{
                                backgroundImage: `url(${user?.user_infos?.profile_image || '/default-avatar.png'})`,
                                backgroundColor: user?.user_infos?.profile_image ? 'transparent' : '#1e3a8a', // fallback color if no image
                            }}
                        ></div>
                        {/* Profile */}
                        <div className={`shadow-xl absolute w-96 h-fit bottom-0 left-16 overflow-hidden rounded-md border-primary bg-white grid grid-rows-[min-content_min-content_min-content]  origin-bottom-left transition-all ease-in-out z-50 ${hover ? 'scale-100' : 'scale-0'}`}  onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
                            <div className='w-full bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)]' >
                                <div className='bg-gradient-to-t from-black via-black/80 w-full h-full flex flex-row items-center gap-2 p-4'>
                                    <div className='bg-white w-16 h-16 shadow-md rounded-full overflow-hidden'>
                                        <div className='w-14 h-14 flex items-center justify-center m-auto mt-1'>
                                            <img src={user?.user_infos?.profile_image} className='rounded-full'/>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='flex flex-row gap-1'>
                                            <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text h-fit border border-primary">{user?.user_infos?.roles[0]?.role_name}</span>
                                            <span className="inline-flex items-center rounded-md bg-primarybg px-2 py-1 text-xs font-medium text-primary font-text h-fit border border-primary">{user?.user_infos?.title?.career_level?.name}</span>
                                        </div>
                                        <div>
                                            <p className='font-header text-white text-lg'>{user?.user_infos?.first_name} {user?.user_infos?.middle_name || ""} {user?.user_infos?.last_name}</p>
                                            <p className='font-text text-white text-xs'>{user.user_infos?.title?.title_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='px-4 pt-4 pb-2 flex flex-col gap-2'>
                                <div>
                                    <p className='text-unactive text-xs'>Division:</p>
                                    <p className='font-text text-sm'>{user.user_infos?.title?.department?.division?.division_name}</p>
                                </div>
                                <div>
                                    <p className='text-unactive text-xs'>Department:</p>
                                    <p className='font-text text-sm'>{user.user_infos?.title?.department?.department_name}</p>
                                </div>
                                <div>
                                    <p className='text-unactive text-xs'>Location</p>
                                    <p className='font-text text-sm'>{user.user_infos?.city?.city_name} - {user.user_infos?.branch?.branch_name}</p>
                                </div>
                            </div>
                            <div className='px-4 pb-2 flex flex-col gap-2 pt-4'>
                                <p className='text-unactive text-xs'>Contact Information:</p>
                                <div>
                                    <p className='font-text text-sm'>{user.MBemail}</p>
                                    <p className='text-unactive text-xs'>MBLearn Registered Email</p>
                                </div>
                                <div className='flex flex-row justify-between items-center'>
                                    <div>
                                        <p className={`font-text text-sm ${user.phone_number ? "text-black": "text-unactive"}`}>{user.phone_number ? user.phone_number : "Nothing Saved Yet"}</p>
                                        <p className='text-unactive text-xs'>MBLearn Registered Phone Number</p>
                                    </div>
                                    <div className='text-unactive hover:text-primary hover:cursor-pointer transition-all ease-in-out'
                                        onClick={()=>{setOpenSavePhone(true); setHover(false)}}>
                                         <FontAwesomeIcon icon={faPencil}/>
                                    </div>
                                </div>

                            </div>
                            <div className='p-2'>
                                <div className='flex flex-row justify-between items-center text-unactive hover:text-primary py-2 px-4 hover:bg-primarybg hover:cursor-pointer rounded-md transition-all ease-in-out' onClick={()=>onLogout()}>
                                    <p>Logout Account</p>
                                    <FontAwesomeIcon icon={faRightFromBracket}/>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            </div>






        }
        {/* <NotificationModal open={openNotficiation} close={() => setOpenNotification(false)}/> */}
        <AddPhoneNumber open={openSavePhone} close={()=>{setOpenSavePhone(false)}}/>
        </>
    )
}
