import { faCheck, faCheckSquare, faChevronLeft, faChevronRight, faFilter, faPenToSquare, faPlus, faSpinner, faTrash, faUserLock, faUsers } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useOption } from "MBLearn/src/contexts/AddUserOptionProvider"
import { useState, useEffect } from "react";
import { format, set } from "date-fns";
import React from "react";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import AddFormInputModal from "./AddFormInput.Modal";
import EditFormInputModal from "./EditFormInput.Modal";
import DeleteFormInputModal from "./DeleteFormInputModal";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "MBLearn/src/components/ui/select";
import axiosClient from "MBLearn/src/axios-client";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import WarningModal from "../WarningModal";
import { toast } from "sonner";



//Front end Pagination
// const usePagination = (data, itemPerpage = 2) => {
//     const [currentPage, setCurrentPage] = useState(1);

//     const indexFirstItem = (currentPage - 1) * itemPerpage;
//     const indexLastItem = Math.min(indexFirstItem + itemPerpage, data?.length);
//     const currentPaginated = data?.slice(indexFirstItem, indexLastItem)
//     const totalPage = Math.ceil(data?.length / itemPerpage)
//     const totalitem = data?.length

//     //Pagination Controll
//     const goto = (pageNum) => {
//         if (pageNum >= 1 && pageNum <= totalPage) setCurrentPage(pageNum);
//     }
//     const next = () => {
//         // setCurrentPage((prev) => Math.min(prev + 1, totalPage));
//         if (currentPage < totalPage) setCurrentPage(currentPage + 1)
//     };

//     const back = () => {
//         if (currentPage > 1) setCurrentPage(currentPage - 1);
//     };

//     return {
//         currentPaginated,
//         currentPage,
//         totalPage,
//         indexFirstItem,
//         indexLastItem,
//         totalitem,
//         goto,
//         next,
//         back
//     }
// }

const DeletedCourseFormInput = ({inputs, selected, setSelected, action, setAction}) => {
    const {user} = useStateContext()
    const {career_level, fetchOptions} = useOption();
    const [department, setdepartment] = useState();
    const [division, setdivision] = useState();
    const [city, setCity] = useState()
    const [level, setLevel] = useState()
    const [entries, setEntries] = useState([]);
    const [processing, setProcessing] = useState(false)

    const [loading, setLoading] = useState(true)
    const [add, setAdd] = useState(false)
    const [edit, setEdit] = useState(false)
    const [_delete, setDelete] = useState(false)
    const [entry, setEntry] = useState()
    const [formInput, setFormInput] = useState()
    const [branches, setBranches] = useState()

    const handleSelected = (id) => {
        if(processing) return;
        setSelected((prev) => {
            const existed = prev.find((entry) => entry.id === id);

            if(existed){
                return prev.filter((entry) => entry.id !== id);
            } else {
                return [...prev, {id}];
            }
        })
    }

    const handleGetDeleted = () => {
        setLoading(true)
        axiosClient.get('getDeletedCourseInputs')
        .then(({data}) => {
            setEntries(data.Deleted_categories)
            setLoading(false)
        })
        .catch(() => {
            setLoading(false)
            console.log("Error in fetching deleted items")
        })
    }

    useEffect(()=>{
        handleGetDeleted()
    },[])



   const handleRestore = () => {
        if (processing) return;
        setAction("");
        setProcessing(true);

        const restorePromise = () =>
            axiosClient.post('/inputs/bulk', {
                data: selected,
                type: "category",
                action: "restore"
            }).then(res => {
                handleGetDeleted();
                setProcessing(false);
                setSelected([]);
                return res.data; // pass response for toast
            });

        toast.promise(restorePromise(), {
            loading: 'Restoring items...',
            success: (data) => data.message || `Successfully restored ${selected.length} items!`,
            error: '❌ Failed to restore items.',
        });
    };


    useEffect(()=>{
        setLoading(true)
        //inputChange(inputs)
    },[inputs, department, division, city, level, fetchOptions])

    return(
        <>
        <div className="grid grid-rows-[min-content_1fr]">

            <div className="py-2">
                <div className="w-full border-primary border rounded-md overflow-hidden shadow-md">
                    <table className='text-left w-full overflow-y-scroll'>
                    <thead className='font-header text-xs text-primary bg-secondaryprimary'>
                        <tr>
                            <th className='py-4 px-4 uppercase'>Input Name</th>
                            <th className='py-4 px-4 uppercase hidden md:table-cell'>Date-Deleted</th>
                            <th className='py-4 px-4 uppercase hidden md:table-cell'></th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-divider'>
                        {
                            loading ?
                                <tr>
                                    <td colSpan={1} className="flex flex-row items-center justify-center md:hidden py-4 gap-x-2">
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin ease-in-out"/>
                                        <p className="font-text text-xs">Loading Items...</p>
                                    </td>
                                    <td colSpan={3} className="md:table-cell py-4 ">
                                        <div className="flex flex-row items-center justify-center gap-x-2">
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin ease-in-out"/>
                                            <p className="font-text text-xs">Loading Items...</p>
                                        </div>
                                    </td>
                                </tr>

                            : entries.length === 0 ?
                                <tr>
                                    <td colSpan={3} className="py-4 gap-x-2 w-full">
                                        <div className="flex flex-col justify-center items-center w-full">
                                            <p className="font-text text-xs">No Entries Found</p>
                                        </div>
                                    </td>
                                </tr>
                            : entries?.map((e) => (
                                <tr key={e.id} className={`font-text text-md hover:bg-gray-200 cursor-pointer ${selected.find((entry) => entry.id === e.id) ? "bg-gray-100":""}`}  onClick={()=>{handleSelected(e.id)}}>
                                    <td className="flex flex-row gap-1 items-center px-4">
                                        <div className="w-fit cursor-pointer">
                                            {
                                                selected.find((entry) => entry.id === e.id) ?
                                                <FontAwesomeIcon icon={faCheckSquare} className="text-primary text-lg"/>
                                                :
                                                <FontAwesomeIcon icon={faSquare} className="text-unactive text-lg"/>
                                            }

                                        </div>
                                        <div className={`px-4 py-2`}>
                                            <p className="font-text text-xs">
                                                {e.division_name || e.department_name || e.title_name || e.city_name || e.branch_name || e.category_name ||"No name given"}
                                            </p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`px-4 py-2`}>
                                            <p className="font-text text-xs">
                                                {e.deleted_at ? format(new Date(e.deleted_at), "MMMM dd yyyy"):"No date given"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="flex-row gap-2 justify-end px-4 py-2 hidden md:flex">

                                        {
                                            user.user_infos.permissions?.some((permission)=> permission.id === 9) ?
                                            <div className='aspect-square w-10 flex flex-row justify-center items-center bg-white border-2 border-primary rounded-md shadow-md text-primary hover:text-white hover:cursor-pointer hover:scale-105 hover:bg-primary ease-in-out transition-all'
                                                // onClick={()=>handleDeleteFormInput(e)}>
                                                >
                                                <FontAwesomeIcon icon={faTrash} className='text-sm'/>
                                            </div> : null
                                        }
                                    </td>

                                </tr>
                            ))
                        }
                    </tbody>
                    </table>
                </div>
            </div>

        </div>

        {/* <EditFormInputModal open={edit} close={()=>setEdit(false)} formInput={formInput} formInputEntry={entry}/> */}
        {/* <DeleteFormInputModal open={_delete} close={()=>setDelete(false)} formInput={formInput} type={inputs} fetchOptions={()=>fetchOptions()}/> */}
        <WarningModal open={action === "restore"} close={()=>setAction("")} title={"Restoring Entries"} desc={"Are you sure you want to restore the following selected Entries"} selected={selected} proceed={()=>{handleRestore()}}/>

        </>
    )
}
export default DeletedCourseFormInput
