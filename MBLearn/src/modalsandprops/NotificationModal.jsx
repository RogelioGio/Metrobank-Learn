import { faBell, faBook, faBookOpenReader, faCircleInfo, faClock, faGraduationCap, faUserGear, faUserMinus, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import axiosClient from "../axios-client";
import { ScrollArea } from "../components/ui/scroll-area";
import { format } from "date-fns";
import { useStateContext } from "../contexts/ContextProvider";

const NotificationModal = ({open, close}) => {
    const {user} = useStateContext()
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState()
    const [loading, setLoading] = useState(false);
    const observer = useRef(null);
    const sentinel = useRef(null)

    const loadMore = (pageNumber) => {
        setLoading(true)
        // axiosClient.get('/index-notifications',{
        //     params:{
        //         page: pageNumber,
        //         limit: 10
        //     }
        // })
        // .then(({data}) => {
        //     setNotifications((prev) =>
        //         //...prev, ...data.data
        //         {const all = [...prev, ...data.data];
        //         const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
        //         return unique;}
        //     );
        //     setPage(data.current_page);
        //     setHasMore(data.current_page < data.last_page)
        //     setLoading(false)
        // })
        // .catch((e) => {
        //     console.log(e)
        // })
    }

    // useEffect(()=>{
    //     console.log('loading state:', loading);
    //     console.log('has more? : ', hasMore)
    // },[loading])

    const readAll = () => {
        axiosClient.post('/mark-as-read')
        .then((data) => {
        }).catch((e) => console.log(e))
    }

    useEffect(() => {
        loadMore(1)

        // echo.private(`App.Models.UserCredentials.${user.id}`)
        // .notification((notification) => {
        //     loadMore(1)
        // });
    },[])
    useEffect(() => {
        if(!open) return
        readAll()
    },[open])

    useEffect(()=>{
        if(!sentinel.current || !hasMore || loading) return

        if(observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(([entry]) => {
            if(entry.isIntersecting && hasMore && !loading ){
                console.log("👀 Intersecting — load more triggered");
                if(loading) return
                loadMore(page+1)
            }
        });

        observer.current.observe(sentinel.current);

        return () => observer.current.disconnect();
    },[page, hasMore,loading])



    // useEffect(()=>{
    //     console.log(notifications)
    //     console.log('current page: ', page , 'hasMore: ', hasMore)
    // },[notifications])

    // const lastEntryref = useCallback((node) => {
    //     if(!hasMore) return;
    //     if(observer.current) observer.current.disconnect();

    //     observer.current = new IntersectionObserver(entries => {
    //         if(entries[0].isIntersecting && hasMore) {
    //             console.log('Loading more notifications...');
    //             loadMore();
    //         }
    //     });

    //     if(node) observer.current.observe(node);
    // },[currentIndex])

    const notificationIcon = (notifications_type) =>{
        switch(notifications_type){
            case 'general' : return faCircleInfo;
            case 'course' : return faBook;
            case 'course_enrollment' : return faGraduationCap;
            case 'course_assignement': return faBookOpenReader;
            case 'course_deadline' : return faClock;
            case 'account_added': return faUserPlus;
            case 'account_deleted': return faUserMinus
            case 'account_accountChange_permission': return faUserGear;
            case 'account_accountChange_role': return faUserGear;
            default: return faBell;
        }
    }

    return (
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40" />
                <div className='fixed inset-0 z-40 w-screen overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text center'>
                        <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40'>
                            <div className='bg-white rounded-md h-full p-5 grid grid-row-5 grid-cols-2 w-[50vw]'>
                                {/* Header */}
                                <div className="pt-2 pb-4 mx-4 border-b border-divider flex flex-row gap-4 col-span-2">
                                    <div>
                                        <h1 className="text-primary font-header text-3xl">Notifications</h1>
                                        <p className="text-unactive font-text text-xs">Displays real-time system alerts, user actions, or important updates, ensuring users are promptly informed</p>
                                    </div>
                                    <div className="flex items-start justify-center">
                                        <div className="rounded-full w-8 h-8 border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all ease-in-out cursor-pointer" onClick={close}>
                                            <FontAwesomeIcon icon={faXmark} />
                                        </div>
                                    </div>
                                </div>
                                {/* Content */}
                                <ScrollArea className="pt-2 pb-4 mx-4 col-span-2 max-h-[25rem]">
                                    <div className="flex flex-col gap-2">

                                        {
                                            notifications.map((n, idx) =>
                                                (<div key={idx} className={`group rounded-md shadow-md p-4 flex flex-row gap-4 hover:cursor-pointer hover:bg-primarybg transition-all ease-in-out ${n.read_at === null ? 'border border-primary' : 'border'}`}>
                                                    <div>
                                                        <div className="h-10 w-10 bg-primarybg rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all ease-in-out">
                                                            <FontAwesomeIcon icon={notificationIcon(n.data.notification_type)} />
                                                        </div>
                                                    </div>
                                                    <div className="text-primary">
                                                        <p className="font-header">{n.data.title}</p>
                                                        <p className="text-xs font-text">{n.data.body}</p>
                                                    </div>
                                                    <div className="ml-auto self-center">
                                                        <p className="font-text text-unactive text-xs">{format(new Date(n.created_at), 'hh:mm a MMMM-dd-yyyy')}</p>
                                                    </div>
                                                </div>)
                                            )
                                        }
                                        {
                                            hasMore &&
                                                    <div ref={sentinel} className="h-10 flex justify-center items-center text-sm text-gray-500">
                                                        Loading more...
                                                    </div>
                                        }
                                        {/* {
                                            Array.from({ length: 10 }).map((_, index) => (<div className="group border border-primary rounded-md shadow-md p-4 flex flex-row gap-4 hover:cursor-pointer hover:bg-primarybg transition-all ease-in-out">
                                                        <div>
                                                            <div className="h-10 w-10 bg-primarybg rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all ease-in-out">
                                                                <FontAwesomeIcon icon={faCircleInfo} />
                                                            </div>
                                                        </div>
                                                        <div className="text-primary">
                                                            <p className="font-header">Sample Notification - {index}</p>
                                                            <p className="text-xs font-text">The unread notifcation body</p>
                                                        </div>
                                                    </div>))
                                        } */}




                                        {/* Unread */}
                                        {/* {
                                            Array.from({ length: 5 }).map((_, index) => (
                                            <div className=" group border border-primary rounded-md shadow-md p-4 flex flex-row gap-4 hover:cursor-pointer hover:bg-primarybg transition-all ease-in-out">
                                                <div>
                                                    <div className="h-10 w-10 bg-primarybg rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all ease-in-out">
                                                        <FontAwesomeIcon icon={faCircleInfo} />
                                                    </div>
                                                </div>
                                                <div className="text-primary">
                                                    <p className="font-header">Sample Notification</p>
                                                    <p className="text-xs font-text">The unread notifcation body</p>
                                                </div>
                                            </div>
                                            ))
                                        } */}
                                        {/* read */}
                                        {/* <div className=" rounded-md shadow-md p-4 flex flex-row gap-4 hover:border hover:border-primary hover:cursor-pointer hover:bg-primarybg transition-all ease-in-out">
                                            <div>
                                                <div className="h-10 w-10 bg-primarybg rounded-full"></div>
                                            </div>
                                            <div className="text-primary">
                                                <p className="font-header">Read Notification</p>
                                                <p className="text-xs font-text">The unread notifcation body</p>
                                            </div>
                                        </div> */}
                                    </div>
                                </ScrollArea>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
        </Dialog>
    )
}

export default NotificationModal;
