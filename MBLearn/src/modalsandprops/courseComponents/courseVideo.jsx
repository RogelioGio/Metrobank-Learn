import { useEffect } from "react"
import ReactPlayer from "react-player"

{/* <div className="mx-5 py-5">
                            <div className="border-divider border-b py-1">
                                <p className="font-header text-sm text-primary">Reference Link</p>
                            </div>
                            <div className="py-1">
                                {
                                    content.referenceBlockcontent.map((reference, _)=>{
                                        return (
                                            <a
                                            key={_}
                                            href={reference.marks[0].attrs.href}
                                            target={reference.marks[0].attrs.target}
                                            rel={reference.marks[0].attrs.rel}
                                            className="hover:cursor-pointer hover:text-primary"
                                            >
                                            <span className="font-text text-sm">
                                                {reference.text}
                                            </span>
                                            </a>
                                        )
                                    })
                                }
                            </div>
                        </div> */}

const CourseVideo = ({ videoSrc}) => {
     //This is will be recycled for Comp-e-Learn's mp4 import

    useEffect(() => {
        console.log("course in course video use effect",  videoSrc);
    }, [videoSrc])

    return(
        <>
        {/* <ReactPlayer
            url="https://www.youtube.com/watch?v=8VE_dbdL_m8"
            controls
            width="45rem"
            height="auto"
            style={{aspectRatio: "16/9"}}/>
        <div className="mx-5 py-5">
            <div className="border-divider border-b py-1">
                <p className="font-header text-sm text-primary">Reference Link</p>
            </div>
            <div className="py-1">
                <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:cursor-pointer hover:text-primary"
                >
                <span className="font-text text-sm">
                    Reference Link
                </span>
                </a>
            </div>
        </div> */}

        <div className="w-full h-[calc(100vh-11rem)] flex">
            <div className="border border-unactive w-full h-full rounded-md overflow-hidden shadow-md bg-white">
                <ReactPlayer
                url = {videoSrc}
                controls
                width="full"
                height="auto"
                style={{aspectRatio: "16/9"}}/>
            </div>
        </div>
        </>
    )
}
export default CourseVideo
