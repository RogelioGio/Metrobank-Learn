import { useEffect, useState } from "react";
import Papa from "papaparse";
import { faChevronDown, faFileArrowUp, faSuitcase, faUser, faUserGroup, faUserPlus } from "@fortawesome/free-solid-svg-icons"
import { faCircleUser as faUserRegular, faCircleCheck as faCircleCheckRegular, faAddressCard as faAddressCardRegular,  faBuilding as faBuildingRegular, faIdBadge as faIdBadgeRegular}  from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import User from "./UserEntryProp";
import axiosClient from "../axios-client";
import { set } from "date-fns";
import BulkAddUserModal from "./BulkAddUserModal";
import { ScrollArea } from "../components/ui/scroll-area";


const AddMultipleUserProps = ({onClose, adding, setAdding}) => {
    const [csvData, setCsvData] = useState([]);
    const [filename, setFilename] = useState("");
    const [jsonData, setJsonData] = useState([]);
    const [dragOver, setDragover] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragover(true);
    };

    const handleDragLeave = (e) => {
        setDragover(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragover(false);

        const file = e.dataTransfer.files[0]; // Get dropped file
        processCsvFile(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        processCsvFile(file);
    };

    const processCsvFile = (file) => {
        if (!file) return; // ✅ Prevents infinite loop

        const fileType = file.name.split('.').pop().toLowerCase();
        if (fileType !== 'csv') {
            alert('Please upload a CSV file');
            return;
        }

        setUploadedFile(true);
        setFilename(file.name);

        const res = JSON.stringify(csvData, null, 2);
        setJsonData(res);
        console.log(res);

        Papa.parse(file, {
            complete: (result) => {
                const filteredData = result.data.filter(row =>
                    Object.values(row).some(value => value.trim() !== "")
                );

                setCsvData(filteredData);

                console.log(filteredData)
            },
            header: true,
            skipEmptyLines: true
        });
    };

    const submitJson = () =>{
        console.log(csvData);
        onClose();
        setAdding(true);
        axiosClient.post('/add-many-users', csvData)
        .then((res) => {
            console.log(res)
            setOpen(true);
            onClose()
        })
        .catch((err) => console.log(err));
    }

    // const csvUploadFn = (e) => {
    //     const file = e.target.files[0];
    //     const fileType = file.name.split('.').pop().toLowerCase();

    //     if (fileType !== 'csv') {
    //         alert('Please upload a CSV file');
    //         return;
    //     }

    //     Papa.parse(file, {
    //         complete: (result) => {
    //             setCsvData(result.data);
    //         },
    //         header: true,
    //     })

    // }

    // const conversionFn = () => {
    //     const res = JSON.stringify(csvData, null, 2);
    //     setJsonData(res);
    //     console.log(res);
    // }


    return (
        <>
        <div>
            {/* <input type="file"
                    onChange={csvUploadFn}
                    accept=".csv" />
            <button className="button"
                    onClick={conversionFn}>
                    Convert to JSON
                </button> */}
            {
                !uploadedFile ? (<div className="py-3 mx-4">
                    <label htmlFor="import"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex flex-col gap-3 justify-center items-center rounded-lg border-2 border-dashed border-unactive px-6 py-10 h-full w-full ${
                            dragOver ? '!border-primary  bg-blue-100' : 'border-unactive'} shadow-md cursor-pointer transition-all ease-in-out`}>
                        <FontAwesomeIcon icon={faFileArrowUp} className={`text-4xl text-unactive ${dragOver ? 'text-primary' : 'text-unactive'}`}/>
                        <p className={`font-text text-center text-xs ${dragOver ? 'text-primary' : 'text-unactive'} text-unactive`}>Upload .csv file to add multiple user in the system</p>

                        {/* Input */}
                        <input type="file" accept=".csv" className="hidden" id="import" onChange={handleFileInput}/>
                    </label>
                    </div>
                    ) : (
                        <>
                    <div className="py-3 mx-4">
                        <p className="text-xs text-unactive">File Uploaded:</p>
                        <p className="text-sm font-text text-primary">{filename}</p>
                    </div>

                    <div className="py-2 mx-4">
                        <ScrollArea className="h-[calc(100vh-20rem)] border border-primary rounded bg-white shadow-sm">
                            <div className="p-4 flex flex-col gap-2">
                                {
                                    csvData.map((entries) => (
                                        <div className="border rounded-md h-fit shadow-md p-4 flex flex-col gap-2">
                                            <div className="flex flex-row justify-between">
                                                <div>
                                                    <p className="font-header">{entries.first_name} {entries.middle_name || ""} {entries.last_name}</p>
                                                    <p className="font-text text-xs text-unactive">ID: {entries.employeeID} | {entries.MBemail}</p>
                                                </div>
                                                <span className='py-1 px-4 bg-primarybg rounded-full font-text text-primary text-xs border-primary border w-fit h-fit'>{entries.role}</span>
                                            </div>
                                            <div className="w-full flex flex-row justify-between">
                                                <div>
                                                    <p className="text-xs font-text">{entries.title}</p>
                                                    <p className="text-xs font-text text-unactive">Title</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <p className="text-xs font-text">{entries.branch}</p>
                                                    <p className="text-xs font-text text-unactive">Location</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </ScrollArea>
                    </div>
                    </>
                )

            }
            {/* <div className="py-3 mx-4">
                <label htmlFor="import"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="flex flex-col gap-3 justify-center items-center rounded-lg border-2 border-dashed border-unactive px-6 py-10 h-full w-full">
                    <FontAwesomeIcon icon={faFileArrowUp} className="text-4xl text-unactive"/>
                    <p className="font-text text-center text-xs text-unactive">Upload .csv file to add multiple user in the system</p>


                    <input type="file" accept=".csv" className="hidden" id="import" onChange={handleFileInput}/>
                </label>
            </div> */}


            <div className="flex flex-row gap-2 mx-4 py-3">
                {/* Cancel Button */}
                <div
                    className={`flex items-center justify-center font-header text-center text-primary border-2 border-primary py-2 rounded-md shadow-md
                                hover:cursor-pointer transition-all ease-in-out
                                hover:bg-primaryhover hover:text-white
                                ${csvData?.length > 0 ? "w-1/2" : "w-full"}`}
                    onClick={onClose}
                >
                    <p>Cancel</p>
                </div>

                {/* Add Users Button (only appears when csvData has items) */}
                {csvData?.length > 0 && (
                    <div
                        className="font-header text-center text-white border-2 border-primary w-1/2 py-3 rounded-md shadow-md
                                bg-primary hover:cursor-pointer transition-all ease-in-out
                                hover:bg-primaryhover hover:text-white"
                        onClick={submitJson}
                    >
                        Add Users
                    </div>
                )}
            </div>
        </div>
        <BulkAddUserModal open={open} close={()=>setOpen(false)}/>
        </>
    );
}
export default AddMultipleUserProps;
