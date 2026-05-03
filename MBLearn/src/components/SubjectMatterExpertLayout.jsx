import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";
import ProtectedRoutes from "../ProtectedRoutes";
import SideNavBar from "../authoring-tool/SideNavBar";
import NavigationBar from "../views/AuthoringTools/NavigationBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBell } from "@fortawesome/free-solid-svg-icons";
import logo from './../assets/AuthoringToolLogo.svg'
import { AuthoringToolProvider } from "../contexts/AuthoringToolContext";
import { DivisionCoursesProvider } from "../contexts/DivisionCoursesContext";
import { CreateCourseProvider } from "../contexts/CreateCourseContext";
import { LessonCanvasProvider } from "../contexts/LessonCanvasContext";
import { AssessmentCanvas } from "../views/AuthoringTools/AssessmentCanvas";
import { AssessmentCanvasProvider } from "../contexts/AssessmentCanvasContext";
import { echoPusherInstance } from "MBLearn/echoPusher";
import NotificationMessageModal from "../modalsandprops/AuthoringTool/NotificationMessageModal";
import ConfirmationModal from "../modalsandprops/AuthoringTool/ConfirmationModal";
import { toast } from "sonner";
import NotificationBellPopup from "../modalsandprops/AuthoringTool/NotificationBellPopup";

export default function SubjectMatterExpertLayout() {
    const {setUser,token, setToken, user, pageTitle, showBack, shouldConfirmBack} = useStateContext()
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [notificationModalShow, setNotificationModalShow] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();

    const handleBackClick = () => {
        if (shouldConfirmBack) {
        setConfirmOpen(true);
        } else {
        navigate(-1);
        }
    };

    const handleConfirmBack = () => {
        setConfirmOpen(false);
        navigate(-1);
    };

    useEffect(() => {
        if(!token) {
            // navigate('/login')
            // return
            console.log("no token")
        }
        //setLoading(true);
        axiosClient.get('/user')
            .then(({data}) => {
                setLoading(false);
                setUser(data.AuthenticatedUser);
            })
            .catch(() => {
                setToken(null)
                navigate('/login')
                setUser(null);
                setLoading(false);
            });

        const faavicon = document.querySelector("link[rel~='icon']");
        faavicon.href = logo;
    },[]);

    // useEffect(() => {
    //     console.log("User: ", data)
    // }, [user]);

    /// --------------------
    /// Notification Bell
    /// --------------------
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // console.log("1`23", user);
    const [message, setMessage] = useState([]);
    useEffect(() => {
        if (!user?.id || !token) return;

        const echo = echoPusherInstance(token);

        const channelName = `notifications.${user.id}`;
        console.log(`Subscribing to ${channelName} channel...`);

        const channel = echo.private(channelName);

        channel.listen('.ViewerAssign', (e) => {
            console.log('Notification received:', e.notification);
            setNotificationMessage(e.notification);
            setNotificationModalShow(true);
            
            if (e.notification?.message) {
                toast(e.notification.message);

                setNotifications((prev) => [
                    {
                        message: e.notification.message,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    },
                    ...prev
                ]);
                setUnreadCount((prev) => prev + 1);
            }
        });

        channel.subscribed(() => {
            console.log(`Subscribed to ${channelName} successfully.`);
        });

        channel.error((error) => {
            console.error(`Error on channel ${channelName}:`, error);
        });

        return () => {
            echo.leave(channelName);
        };
    }, [user?.id, token]);    


    const [loadingNotifications, setLoadingNotifications] = useState(true);
    useEffect(() => {
        if (!user?.id || !token) return;

        setLoadingNotifications(true);
        axiosClient.get("/notifications")
        .then(({ data }) => {
            setNotifications(data);
            const unread = data.filter(n => !n.ReadAt).length;
            setUnreadCount(unread);
        })
        .catch(() => {
            setNotifications([]);
            setUnreadCount(0);
        })
        .finally(() => {
            setLoadingNotifications(false);
        });
    }, [user?.id, token]);


    return (<>
        {
            loading ?
            <div className="h-screen flex flex-col items-center justify-center gap-2">
                <div className="flex flex-row items-center justify-center gap-2 ">
                    <img src={logo} alt="MBLearn Logo" className="h-16"/>
                    <div className="leading-none">
                        <p className="font-header text-lg text-primary">Competitive</p>
                        <p className="text-xs">E-Learning</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <p className="font-header text-3xl text-primary">Loading your development of your future...</p>
                    <p className="font-text text-xs">Developing bright future for you and for everyone</p>
                </div>
            </div>
            :
            <div className="grid h-screen grid-cols-[min-content_1fr_1fr_1fr] grid-rows-[5rem_1fr] bg-background">
                <NavigationBar className={'row-span-2'}/>
                <div className=" flex items-center justify-start col-span-2 gap-2">
                    {
                        showBack &&
                        <button onClick={handleBackClick} className="border-2 border-primary rounded-full justify-center items-center flex w-9 h-9 hover:bg-primary hover:text-white transition-all ease-in-out text-primary ">
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                        </button>
                    }
                    <div>
                        <p className="font-text text-xs text-unactive uppercase">{user?.user_infos.roles?.[0]?.role_name}</p>
                        <p className="font-header text-4xl text-primary">{pageTitle}</p>
                    </div>
                </div>

                <div className="col-start-4 flex flex-row justify-end items-center pr-5 w-full gap-3">
                    {/* UserName */}
                    <div className="flex flex-col items-end justify-center leading-tight">
                        <p className="font-header text-primary">{user?.user_infos?.first_name} {user?.user_infos?.middle_name || ""} {user?.user_infos?.last_name} </p>
                        <p className="font-text text-xs text-unactive">{user?.MBemail}</p>
                    </div>
                    {/* User PFP */}
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                        <img src={user?.user_infos?.profile_image} alt="" />
                    </div>

                    <div className="relative">
                        <div
                            className="text-unactive hover:text-primary transition-all ease-in-out cursor-pointer"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <FontAwesomeIcon icon={faBell} className="text-3xl" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {dropdownOpen && (
                        <NotificationBellPopup
                            notifications={notifications}
                            setNotifications={setNotifications}
                            unreadCount={unreadCount}
                            setUnreadCount={setUnreadCount}
                            loading={loadingNotifications}
                            onClose={() => setDropdownOpen(false)}
                        />
                        )}
                    </div>
                </div>

                <div className="col-span-3">
                    <AuthoringToolProvider>
                        <DivisionCoursesProvider>
                            <CreateCourseProvider>
                                <LessonCanvasProvider>
                                    <AssessmentCanvasProvider>
                                        <Outlet/>
                                    </AssessmentCanvasProvider>
                                </LessonCanvasProvider>
                            </CreateCourseProvider>
                        </DivisionCoursesProvider>
                    </AuthoringToolProvider>
                </div>
            </div>
        }

        {/* <NotificationMessageModal open={notificationModalShow} close={() => setNotificationModalShow(false)} classname="fixed inset-0 z-50" notification={notificationMessage} /> */}
        <ConfirmationModal
            open={confirmOpen}
            cancel={() => setConfirmOpen(false)}
            confirm={handleConfirmBack}
            header="Confirm Navigation"
            desc="Are you sure you want to go back? Unsaved changes might be lost."
            confirming={false}
        />
    </>
    )
}
