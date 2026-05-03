import { useState, useEffect } from "react"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck, faCircleXmark, faXmark } from "@fortawesome/free-solid-svg-icons"
import axiosClient from "MBLearn/src/axios-client";

const ApproveSheet = ({response, initialResponseType, courseId}) => {
    const [feedback, setFeedback] = useState('');
    const [responseType, setResponseType] = useState(initialResponseType || null);

    useEffect(() => {
        setResponseType(initialResponseType);
    }, [initialResponseType]);

    const handleSubmit = () => {
        response({ action: responseType, feedback });
    };

      const responseDetails = {
        approved: {
            label: 'Approved',
            icon: faCircleCheck,
            style: 'bg-primary text-white border-primary',
        },
        rejected: {
            label: 'Rejected',
            icon: faCircleXmark,
            style: 'bg-red-500 text-white border-red-500',
        },
    };

    /// --------------------
    /// Fetch Other Approvers
    /// --------------------
    const [otherApprovers, setOtherApprovers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!courseId) return;

        const fetchOtherApprovers = async () => {
            try {
                const { data } = await axiosClient.get(`/fetchOtherApprovers/${courseId}`);
                setOtherApprovers(data);
            } catch (error) {
                console.error("Failed to fetch reviewers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOtherApprovers();
    }, [courseId]);


    console.log(otherApprovers);

    return (
    <>
        <div>
            <h1 className="font-header text-2xl text-primary">Course Approval</h1>
            <p className="text-md font-text text-unactive text-xs">Review the details and approve if everything is in order.</p>
        </div>

        <div className="flex flex-col gap-2">
            <p className="font-text text-xs">Approval Response:</p>
            {
                responseType ?
                <div className={`p-4 border-2 rounded-md shadow-md font-header w-full flex justify-center items-center ${responseDetails[responseType].style}`}>
                    <FontAwesomeIcon icon={responseDetails[responseType].icon} className="mr-2 text-xl" />
                    <p>{responseDetails[responseType].label}</p>
                </div>
                :
                <p className="font-text text-sm text-unactive italic">No response selected</p>
            }
        </div>

        <div className="inline-flex flex-col gap-2">
            <label htmlFor="feedback" className="font-text text-xs flex flex-row justify-between">Your Response:</label>
            <textarea className="h-28 font-text border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary resize-none"
                name="feedback"
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
            />
        </div>

        <div>
            <div className="py-2 border-primary border-2 rounded-md bg-white shadow-md font-header w-full flex justify-center items-center text-primary hover:cursor-pointer hover:bg-primary hover:text-white transition-all ease-in-out"
                onClick={handleSubmit}
            >
                <p>Submit Response</p>
            </div>
        </div>

        {otherApprovers.length === 0 ?
            <p className="text-xs text-unactive italic">No responses yet.</p>
        :
            otherApprovers.map((approver) => {
                const initials = approver.user_name
                    ? approver.user_name.split(' ').map(namePart => namePart.charAt(0)).join('').toUpperCase()
                    : 'NA';

                return (
                    <div
                        className="border border-divider rounded-md p-4 h-fit flex flex-col overflow-y-auto shadow-md"
                        key={approver.id}
                    >
                        <div className="flex flex-row gap-2">
                            <div className="min-w-10 min-h-10 w-10 h-10 rounded-full bg-primary text-white font-header flex justify-center items-center uppercase">
                                {initials}
                            </div>
                            <div>
                                <div className="flex flex-col justify-between">
                                    <p className="font-header text-sm text-primary">{approver.user_name || 'N/A'}</p>
                                    <p className="text-xs font-text text-unactive">
                                        ID: {approver.employee_id || 'N/A'} | Email: {approver.email || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="font-text text-xs mt-2">
                                Response:{' '}
                                <span
                                    className={`font-header text-sm ${
                                        approver.approval_status === 'approved'
                                            ? 'text-green-600'
                                            : approver.approval_status === 'rejected'
                                            ? 'text-red-600'
                                            : 'text-yellow-500'
                                    }`}
                                >
                                    {approver.approval_status || 'Pending'}
                                </span>
                            </p>
                            {approver.feedback && (
                                <p className="font-text text-xs mt-1 italic text-gray-600">"{approver.feedback}"</p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">
                                Last updated: {approver.updated_at ? new Date(approver.updated_at).toLocaleString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                );
            })
        }
    </>
  );
};
export default ApproveSheet
