import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBookBookmark, faCircleCheck, faCircleDot, faCircleExclamation, faCircleXmark, faXmark } from "@fortawesome/free-solid-svg-icons"
import { useParams } from "react-router"
import axiosClient from "MBLearn/src/axios-client"
import { useEffect, useState } from "react"

const PublishingSheet = ({publishCourse}) => {
    const {id} = useParams()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(false)

    const getResponses = () => {
        setLoading(true);
        axiosClient.get(`/responses/${id}`)
        .then(({data}) => {
            setReviews(data);
            setLoading(false);
        }).catch((error) => {
            console.error("Error fetching responses: ", error);
        });
    }

    useEffect(() => {
        getResponses();
    },[id])

    const hasRevise = reviews.some(item => item.approval_status === "rejected");

    return (
        <>
            <div className="flex flex-col gap-2 justify-between h-full">
                <div className="flex flex-col gap-2">
                    <div>
                        <h1 className='font-header text-2xl text-primary'>Publish Course</h1>
                        <p className='text-md font-text text-unactive text-xs'>Review list or responses and publish the course.</p>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <div className={`p-4 border-primary border-2 rounded-md bg-white shadow-md font-header w-full flex justify-center items-center text-primary ${hasRevise || loading ? "opacity-50 hover:cursor-not-allowed" : "hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"}`}
                            onClick={() => {
                                if(hasRevise || loading) return;
                                publishCourse();
                            }}>
                            <FontAwesomeIcon icon={faBookBookmark} className="mr-2 text-xl"/>
                            <p>Publish Course</p>
                        </div>
                        {
                            hasRevise ?
                            <p className="text-red-500 text-xs font-text text-center">Cannot publish the course. One or more reviewers have requested revisions.</p>
                            : <p className="text-primary text-xs font-text">All reviewers have approved. You can publish the course.</p>
                        }
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-text text-xs text-unactive">Viewer Responses:</p>
                    <div className="border-divider border rounded-md bg-white shadow-md gap-2 h-[calc(100vh-14rem)]">
                        <div className="flex flex-col p-4 gap-2">
                            {
                                reviews.map((item, index) => 
                                    <div key={index} className="border border-divider rounded-md p-4 h-fit flex flex-col overflow-y-auto shadow-md">
                                        <div className="flex flex-row gap-4">
                                            <div className="min-w-10 min-h-10 h-10 w-10 rounded-full bg-primary ">
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-header text-primary">{item.user_info.first_name} {item.user_info.middle_name || ""} {item.user_info.last_name}</p>
                                                <p className="text-xs font-text text-unactive">ID: {item.user_info.employeeID} </p>
                                                <p className="text-xs font-text text-unactive">{item.user_info.user_credentials.MBemail}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-text text-xs mt-2 text-unactive">Response:</p>
                                            <div className={`border ${item.approval_status === "approved" ? "border-green-800 bg-green-400 text-green-800" : item.approval_status === "rejected" ? "border-red-800 bg-red-400 text-red-800" : "border-yellow-600 bg-yellow-400 text-yellow-800"} flex flex-row items-center justify-center p-2 rounded-md  font-text text-xs`}>
                                                <FontAwesomeIcon icon={item.approval_status === "approved" ? faCircleCheck : item.approval_status === "rejected" ? faCircleXmark : faCircleExclamation} className="mr-2 text-xl"/>
                                                <p className="font-header text-sm">{item.approval_status === "approved" ? "Approved" : item.approval_status === "rejected" ? "Reject" : "Pending"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>            
        </>
    )
}

export default PublishingSheet
