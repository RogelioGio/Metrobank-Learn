import { useEffect, useState } from 'react';
import Week7PDF from './week7.pdf';

const CourseText = ({attachment}) => {
    //This is will be recycled for Comp-e-Learn's docx and pdf import

    const wordExtensions = ["doc", "docx", "dot", "dotx", "docm", "dotm", "rtf", "odt", "xml", "txt", "mht", "mhtml"];
    const powerpointExtensions = ["ppt", "pptx", "pps", "ppsx", "pot", "potx"];
    const excelExtensions = ["xls", "xlsx", "xlsm", "xlt", "xltx"];

    const [extension, setExtension] = useState("");
    const [ownDomain, setOwnDomain] = useState("");

    const hasMBLearn = (url) => {
    try {
        const parsed = new URL(url);
        return (
            parsed.hostname.includes("api.mb-authoringtool.online") || parsed.hostname.includes("mblearn.online")
        )
    } catch {
        // if url is not valid (maybe a local path)
        return false;
    }
    };

    useEffect(() => {
    if (attachment && typeof attachment === "string") {
        const ext = '.' + attachment.split('.').pop().split(/\#|\?/)[0];
        setExtension(ext);
    } else {
        const ext = '.' + attachment.content.split('.').pop().split(/\#|\?/)[0];
        setExtension(ext);
        setOwnDomain(hasMBLearn(attachment.content));
    }
    }, [attachment]);

    return(
        <>
            {
                ownDomain ?
                <>
                    {
                        extension === ".pdf" ?
                        <iframe
                            src={attachment.content}
                            className="w-full border rounded-lg shadow bg-white h-[calc(100vh-11rem)]"
                            title="PDF Viewer"
                        /> :
                        wordExtensions.includes(extension.replace('.', '')) || powerpointExtensions.includes(extension.replace('.', '')) || excelExtensions.includes(extension.replace('.', '')) ?
                        <div className='w-full h-[calc(100vh-11rem)] flex justify-center bg-white rounded-md border border-divider p-4'>
                            <div className='w-full h-fit flex flex-col justify-center gap-4 border border-divider p-4 rounded-md'>
                                <div className='flex flex-row justify-between'>
                                    <div>
                                        <p className='text-xs text-unactive'>File Name:</p>
                                        <p>{attachment.name}</p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-unactive'>File Type:</p>
                                        <p>{extension.toUpperCase().replace('.', '')}</p>
                                    </div>
                                </div>
                                <div>
                                    <a
                                    href={attachment.content}
                                    download
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >Download File</a>
                                </div>
                            </div>
                        </div> :
                        null
                    }
                </> :
                <div className='w-full h-[calc(100vh-11rem)] flex justify-center bg-white rounded-md border border-divider p-4'>
                    <div className='w-full h-fit flex flex-col justify-center gap-4 border border-divider p-4 rounded-md'>
                        <div className='flex flex-row justify-between'>
                            <div>
                                <p className='text-xs text-unactive'>File Name:</p>
                                <p>{attachment.name}</p>
                            </div>
                            <div>
                                <p className='text-xs text-unactive'>File Type:</p>
                                <p>{extension.toUpperCase().replace('.', '')}</p>
                            </div>
                        </div>
                        <div>
                            <a
                            href={attachment.content}
                            download
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >Download File</a>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
export default CourseText
