import { faArrowLeft, faBell, faBook, faFile, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ScrollArea } from "../components/ui/scroll-area";
import axiosClient from "../axios-client";
import { format, set } from "date-fns";
import { useStateContext } from "../contexts/ContextProvider";
import { MBLearnEcho } from "MBLearn/MBLearnEcho";
import { toast } from "sonner";

export default function Notifications() {
    const navigate = useNavigate();
    const {user, token, setUnread} = useStateContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [reading, setReading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchNotifications();
    },[])

    useEffect(()=>{
        if(token){
            window.Echo = MBLearnEcho(token);
            const channelName = `App.Models.UserCredentials.${user?.id}`;
            const channel = window.Echo.private(channelName);

            channel.notification((notifications)=>{
                fetchNotifications()
            })
        }
    },[token])

    const fetchNotifications = () => {
        setLoading(true);
        axiosClient.get('/getNotifications')
        .then(({data}) => {
            setLoading(false);
            setNotifications(data);
            console.log(data);
            setSelectedNotification({...data[0]?.data, id: data[0]?.id});
        })
        .catch((err) => {
            console.log(err);
            setLoading(false);
            setNotifications([]);
        })
    }

    const handleReadAll = () => {
        setReading(true);
        axiosClient.post('/notification/read')
        .then(() => {
            setReading(false);
            fetchNotifications();
            setUnread(false)
        })
        .catch((err) => {
            console.log(err);
            setReading(false);
        })
    }

    const handleDeleteNotification = (id) => {
        setDeleting(true);
        axiosClient.delete(`/notification/delete/${id}`)
        .then(() => {
            toast.success('Notification deleted successfully');
            fetchNotifications();
            setDeleting(false);
        })
        .catch((err) => {
            console.log(err);
        })
    }




    return (
        <div className="grid grid-cols-4 grid-rows-[min-content_1fr] gap-2 w-full h-full">
            <div className="col-span-2 flex gap-4 py-4 items-center">
                <div>
                    <div className="w-10 h-10 flex items-center justify-center text-primary border-primary border-2 rounded-full hover:cursor-pointer hover:bg-primary hover:text-white transition"
                        onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faArrowLeft} className=''/>
                    </div>
                </div>
                <div className="leading-none">
                    <p className="font-header text-primary text-2xl">Notifications</p>
                    <p className="font-text text-xs text-unactive">List of Notification</p>
                </div>
            </div>
            <div className="pr-4 flex flex-col gap-1 items-end justify-center col-span-2">
                <div className="px-4 py-2 bg-white border-2 border-primary rounded-md flex items-center gap-2 text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition font-header"
                    onClick={()=>{
                        if (reading) return;
                        handleReadAll()}}>
                    {
                        reading ?
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin"/>
                            <p>Marking...</p>
                        </>
                        : <>
                            <FontAwesomeIcon icon={faBell} className=""/>
                            <p>Mark all read</p>
                        </>
                    }
                </div>
            </div>

            <div className="col-span-1 flex flex-col gap-1 col-start-1 row-start-2">
                <p className="font-text text-xs text-unactive">Notifications:</p>
                <ScrollArea className="h-[calc(100vh-7.3rem)] border border-divider rounded-md bg-white">
                    <div className="p-4 flex flex-col gap-2 w-full">
                        {
                            loading ?
                            Array.from({length: 5}).map((_, index) => (
                                <div key={index} className="animate-pulse h-20 bg-white border border-divider shadow-md rounded last:mb-0">

                                </div>
                            )) : notifications.length === 0 ?
                            <div className="h-[calc(100vh-10rem)] bg-white  rounded mb-2 last:mb-0 flex items-center justify-center">
                                <p className="font-text text-sm text-unactive">No Notifications</p>
                            </div>
                            :
                            notifications.map((notification) => {
                                const read = notification.read_at !== null;
                                return (
                                    <div className={`p-4 border border-divider shadow-md rounded-md hover:cursor-pointer hover:border-primary transition ${read ? "opacity-50" : ""} `}
                                        key={notification.id}
                                        onClick={() => setSelectedNotification({...notification.data, id: notification.id})}>
                                        <p className="text-sm text-primary font-header">{notification.data.name}</p>
                                        <p className="text-xs">{notification.data.shortdesc}</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                </ScrollArea>
            </div>
            <div className="col-span-3 col-start-2 row-start-2 pb-2 flex flex-col gap-1 pr-4">
                <p className="font-text text-xs text-unactive">Notifcation Details:</p>
                <div className=" border border-divider rounded-lg bg-white w-full h-full">
                    {
                        false ?
                        <div className="h-full w-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary text-2xl"/>
                        </div>
                        :
                        selectedNotification && notifications ?
                        <div className="col-start-2 col-span-2 grid grid-rows-[min-content_1fr] bg-white">
                                <div className="p-4 border-b border-divider bg-primary text-white rounded-t-md h-40 flex flex-col justify-between">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            {selectedNotification.timedone ? <p className="font-text text-xs">Received on {format(new Date(selectedNotification.timedone), 'MMM dd, yyyy HH:mm')}</p>
                                                : null
                                            }
                                        </div>
                                        <div className="flex text-xs items-center justify-center border-white border-2 rounded-md w-8 h-8 hover:cursor-pointer hover:bg-white hover:text-primary transition"
                                            onClick={()=>{
                                                if (deleting) return;
                                                handleDeleteNotification(selectedNotification.id);
                                                console.log(selectedNotification.id)
                                            }}>
                                            {
                                                deleting ?
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin"/>
                                                :
                                                <FontAwesomeIcon icon={faTrash}/>
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-text text-xs">{selectedNotification.type}</p>
                                        <p className="font-header text-2xl">{selectedNotification.name}</p>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col gap-2 overflow-y-auto">
                                    <p className="font-text text-xs">{selectedNotification.shortdesc}</p>
                                    <p className="font-text text-xs">{selectedNotification.fulldesc}</p>
                                </div>
                            </div>
                        : null
                    }
                </div>
            </div>
        </div>
    )

}
