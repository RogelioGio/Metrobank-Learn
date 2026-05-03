
import { NavLink, useNavigate } from "react-router"
import Logo from "../../assets/AuthoringToolLogo.svg"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClipboardList, faFolder, faGraduationCap, faHouse, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { toast } from 'sonner';
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import axiosClient from "MBLearn/src/axios-client";

const NavIcons = ({to, icon, text}) => {
    return (
        <NavLink to={to} className={({ isActive }) => `${isActive ? "text-primary" : "text-unactive"} hover:text-primary group relative z-20`}>
            <FontAwesomeIcon icon={icon} className="text-lg"/>
            <div className='absolute bg-tertiary rounded-md left-6 -bottom-1 scale-0 group-hover:scale-100 hover:scale-100 p-2 transition-all ease-in-out'>
            <p className='font-text text-xs text-white whitespace-nowrap'>{text}</p>
            </div>
        </NavLink>
    )
}

export default function NavigationBar({className}) {
    const {setRole, setUser, setToken, user} = useStateContext();
    const navigate = useNavigate();
    const handleLogout = () => {
        toast("Logging Out....",{
                    description: "User account is logging out the system",
                }
        )
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
        <div className={`p-4 h-full w-24 ${className}`}>
            <div className="bg-white h-full w-fit shadow-md rounded-full flex flex-col py-2 px-2 ">
                <div className="p-[0.625rem] h-full flex flex-col justify-between items-center">
                    <div className="flex flex-col items-center justify-between">
                        <img src={Logo} className="h-14"/>
                        <ul className="flex flex-col items-center gap-4 mt-2">
                            <li>
                                <NavIcons to={"/SubjectMatterExpert/dashboard"} icon={faHouse} text={"Dashboard"}/>
                            </li>
                            {
                                user.user_infos.roles?.[0]?.role_name === "SME-Creator" &&
                                <li>
                                    <NavIcons to={"/SubjectMatterExpert/contentHub"} icon={faGraduationCap} text={"Content Hub"}/>
                                </li>
                            }
                            <li>
                                <NavIcons to={"/SubjectMatterExpert/contentBank"} icon={faFolder} text={"Content Bank"}/>
                            </li>
                            <li>
                                <NavIcons to={"/SubjectMatterExpert/userReports"} icon={faClipboardList} text={"User Reports"}/>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div className="group relative z-50">
                            <div className="cursor-pointer" onClick={()=>handleLogout()}>
                                <FontAwesomeIcon icon={faRightFromBracket} className="text-lg text-unactive hover:text-primary"/>
                            </div>
                            <div className='absolute bg-tertiary rounded-md left-6 -bottom-1 scale-0 group-hover:scale-100 hover:scale-100 p-2 transition-all ease-in-out'>
                                <p className='font-text text-xs text-white whitespace-nowrap'>Log-out</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
