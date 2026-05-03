import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router";
import { useStateContext } from "../contexts/ContextProvider";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCertificate } from "../contexts/CertificateContext";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { format } from "date-fns";


export default function LearnerCertficatesPreview() {
    const {role, user} = useStateContext();
    const {id} = useParams();
    const navigate = useNavigate();
    const {certificate, setCertificate} = useCertificate();
    const [loading, setLoading] = useState(false);


    const handleContent = () => {
        if(!certificate) return;
        const url = certificate?.outside_certificate_url
        const extension = url?.split('.').pop().toLowerCase();

        if(extension === 'pdf'){
            // Handle PDF rendering
            return(
            <>
                <iframe
                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/${url}`} // must change in prod
                    className="w-full h-full"
                    title="PDF Viewer"
                />
            </>)
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)){
            return(
                <>
                    <div className="rounded-md w-full h-full flex items-center justify-center overflow-hidden">
                        <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${url}`}  alt="" />
                    </div>
                </>)
        } else {
            return (
                "Unsupported certificate format."
            )
        }
    }

    const getCertificateData = () => {
        setLoading(true);
        axiosClient.get(`/getCertificate/${id}`)
        .then(({data}) => {
            setCertificate(data.data);
            console.log(data)
            setLoading(false);
        })
        .catch(() => {
            setLoading(false);
        })
    }

    useEffect(() => {
        if(certificate === null){
            getCertificateData();
        }
    },[certificate])

    return (
        <>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | {"Certificate Preview"}</title>
            </Helmet>
            <div className={`grid grid-cols-4 grid-rows-[min-content_1fr] h-full`}>
                <div className="flex flex-row gap-4 col-span-3 py-2 items-center">
                    <div className="min-w-10 min-h-10 h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primaryhover hover:cursor-pointer hover:text-white transition-all ease-in-out text-lg text-primary" onClick={() => {navigate(-1);}}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </div>
                    <div className="font-text text-xs text-unactive">
                        <p>Certificate Preview</p>
                        {
                            loading || !certificate ?
                            <>
                                <div className="h-[1.75rem] w-52 bg-gray-300 rounded-md animate-pulse"></div>
                                <div className="h-[1rem] w-20 bg-gray-300 rounded-md animate-pulse mt-1"></div>
                            </>:
                            <>
                                <p className="font-header text-primary text-xl">{certificate.external_certificate_name || "Certificate Name"}</p>
                                <p>Date Added: {certificate.created_at ? format(new Date(certificate.created_at), "MMMM dd yyyy") : null}</p>
                            </>
                        }
                    </div>
                </div>
                <div className="flex flex-row pr-4 justify-end items-center">
                    {
                        loading ? null :
                        <a className="flex flex-row gap-2 items-center px-4 py-2 font-header text-white bg-primary rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out"
                            href={`${import.meta.env.VITE_API_BASE_URL}/storage/${certificate?.outside_certificate_url}`}
                            download>
                            <FontAwesomeIcon icon={faDownload}/>
                            <p>Download</p>
                        </a>
                    }
                </div>
                <div className="col-span-4 pr-4 pb-4">
                    {
                        loading ?
                        <div className="w-full h-full border border-divider rounded-md shadow-md overflow-hidden bg-white animate-pulse" />
                        :
                        <div className="w-full h-full border border-divider rounded-md shadow-md overflow-hidden bg-white">
                        {handleContent()}
                        </div>
                    }
                </div>
            </div>
        </>
    );
}
