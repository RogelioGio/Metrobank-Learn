import { faArrowLeft, faBook, faCertificate, faGraduationCap, faPenToSquare, faUserGroup, faUserLock, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../contexts/selecteduserContext";


const SelectUser = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState("permission");
    const {id} = useParams();
    const {selectedUser, selectUser, isFetching} = useUser();
    const [isLoading, setLoading] = useState(true);
    const [date, setDate] = useState();

    useEffect(() => {
            if (id) {
                if (selectedUser?.id === id) {
                    setLoading(false);
                } else {
                    setLoading(true);
                    selectUser(id);
                }
            }
        }, [id, selectedUser,]);
        useEffect(() => {
            if (selectedUser && !isFetching) {
                setLoading(false);
            }
        }, [selectedUser, isFetching]);

    useEffect(() => {
        setLoading(isFetching);
    }, [isFetching]);

    //function for readable dates
    useEffect(() => {
        if(selectedUser?.created_at){
            const created_date = new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                year: 'numeric',  // Display the full year (e.g., 2025)
                month: 'long',    // Display the full month name (e.g., January)
                day: 'numeric'    // Display the numeric day (e.g., 16)
            });
            setDate(created_date)
        }
    },[selectedUser])


    return (
        <div className='grid  grid-cols-4 grid-rows-[min-content_min-content_1fr_min-content] h-full w-full overflow-hidden'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | User Detail</title>
            </Helmet>

            {/* Header */}
            <div className="flex flex-row col-span-4 row-span-1 item-center mx-5 border-b border-divider">
                <div className="text-primary flex flex-row justify-center items-start py-5" onClick={() => navigate(-1)}>
                    <div className="flex flex-row justify-center items-center w-10 aspect-square border-2 border-primary rounded-full hover:scale-105 hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-2xl"/>
                    </div>
                </div>
                <div className="p-10">
                    {/* Image */}
                    <div className={`w-32 aspect-square bg-primary rounded-full shadow-md ${isLoading ? "animate-pulse" : ""}`}>
                        <img src={selectedUser?.profile_image} alt="" className='w-full bg-primary rounded-full'/>
                    </div>
                </div>
                <div className=' px-5 flex flex-col justify-center w-full gap-4'>
                    <div className="flex flex-row justify-between">
                        <div>
                            <p className="font-text text-unactive text-xs">Name</p>
                            <h1 className='text-primary text-4xl font-header'>{selectedUser
                                ? `${selectedUser.first_name ?? ''} ${selectedUser.middle_name ?? ''} ${selectedUser.last_name ?? ''}`.trim()
                                : 'Loading...'}</h1>
                            <p className="font-text text-unactive text-sm">{selectedUser ? `ID: ${selectedUser?.employeeID || ""}` : "Not Available"}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="font-text text-unactive text-xs">Account Status</p>
                            <p className='font-header text-lg text-primary'>{selectedUser ? `${selectedUser?.status || "Loading..."}` : "Not Available"}</p>
                        </div>

                    </div>
                    <div className="flex flex-row justify-between">
                        <div>
                            <p className="font-text text-unactive text-xs">Department & Title</p>
                            <p className='font-header text-lg text-primary'>{selectUser ? `${selectedUser?.department?.department_name || "Loading..."}` : "Not Available"}</p>
                            <p className='font-text text-sm text-primary'>{selectUser ? `${selectedUser?.title?.title_name || ""}` : "Not Available"}</p>
                        </div>
                        <div>
                            <p className="font-text text-unactive text-xs">City & Location</p>
                            <p className='font-header text-lg text-primary'>{selectUser ? `${selectedUser?.city?.city_name || "Loading..."}` : "Not Available"}</p>
                            <p className='font-text text-sm text-primary'>{selectUser ? `${selectedUser?.branch?.branch_name || " "}` : "Not Available"}</p>
                        </div>
                        <div>
                            <p className="font-text text-xs text-unactive">Employee Account Role</p>
                            <p className="font-header text-lg text-primary">{selectUser ? `${selectedUser?.roles?.[0]?.role_name || "Loading..."}` : "Not Available"}</p>
                        </div>
                        <div>
                            <p className="font-text text-xs text-unactive">Employee Account Added</p>
                            <p className="font-header text-lg text-primary">{date ? `${date}` : "Loading..."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className='row-start-2 col-span-4 w-auto mx-5 py-3 gap-3'>
                <div className="w-full flex flex-row rounded-md shadow-md hover:cursor-pointer">
                    <span className={`w-1/2 flex flex-row gap-5 items-center text-md font-header ring-2 ring-primary rounded-l-md px-5 py-2 text-primary hover:bg-primary hover:text-white transition-all ease-in-out ${tab === "permission" ? "bg-primary text-white" : "bg-white text-primary"}`} >
                        <FontAwesomeIcon icon={faUserLock}/>
                        Account Permissions
                    </span>
                    <span className={` w-1/2 flex flex-row gap-5 items-center text-md font-header ring-2 ring-primary px-5 py-2 text-primary hover:bg-primary hover:text-white transition-all ease-in-out`} >
                        <FontAwesomeIcon icon={faUserGroup}/>
                        My Employees
                    </span>
                    <span className={` w-1/2 flex flex-row gap-5 items-center text-md font-header ring-2 ring-primary px-5 py-2 text-primary hover:bg-primary hover:text-white transition-all ease-in-out`} >
                        <FontAwesomeIcon icon={faBook}/>
                        Assigned Courses
                    </span>
                    <span className={` w-1/2 flex flex-row gap-5 items-center text-md font-header ring-2 ring-primary px-5 py-2 text-primary hover:bg-primary hover:text-white transition-all ease-in-out`} >
                        <FontAwesomeIcon icon={faGraduationCap}/>
                        Enrolled Courses
                    </span>
                    <span className={` w-1/2 flex flex-row gap-5 items-center text-md font-header ring-2 ring-primary rounded-r-md px-5 py-2 text-primary hover:bg-primary hover:text-white transition-all ease-in-out`} >
                        <FontAwesomeIcon icon={faCertificate}/>
                        Certificates
                    </span>
                </div>
            </div>

        </div>
    )
}
export default SelectUser;
