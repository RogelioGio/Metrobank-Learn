import { useEffect } from "react";
import { useState } from "react";
import axiosClient from "../../axios-client";
import { useParams } from "react-router-dom";
import { useCourse } from "MBLearn/src/contexts/selectedcourseContext";
import CourseLoading from "../../assets/Course_Loading.svg";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";

const CourseCertificateCPL = ({certificate}) => {
    const [isLoading ,setLoading] = useState(false);

    console.log("hey check 2", certificate);

    return (
    <>
    
      <iframe
        src={`https://api.mb-authoringtool.online/api/certificateCreditorCredentials/${certificate.id}`}
        width="100%"
        height="800"
        style={{ border: "none" }}
        title="Certificate"
      />

    </>
    );
};


export default CourseCertificateCPL
