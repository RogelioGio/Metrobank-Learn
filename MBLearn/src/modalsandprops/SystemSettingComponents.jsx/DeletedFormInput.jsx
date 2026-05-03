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

const DeletedFormInput = ({inputs, selected, setSelected, action, setAction}) => {
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

    const [divisions, setDivision] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [titles, setTitles] = useState([]);
    const [cities, setCities] = useState([]);
    const [location, setLocation] = useState([]);

    const [deletedDivisions, setDeletedDivisions] = useState([]);
    const [deletedDepartments, setDeletedDepartments] = useState([]);
    const [deletedTitles, setDeletedTitles] = useState([]);
    const [deletedCities, setDeletedCities] = useState([]);
    const [deletedBranches, setDeletedBranches] = useState([]);



    // const handleFormInput = (input) => {
    //     setFormInput(input)
    //     setAdd(true)
    // }

    // const handleEditFormInput = ({input, entry}) => {
    //     setFormInput(input)
    //     setEntry(entry)
    //     setEdit(true)
    // }

    // const handleDeleteFormInput = (input) => {
    //     setFormInput(input)
    //     setDelete(true)
    // }
    const handleSelected = (id) => {
        if(processing) return
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
        axiosClient.get('getDeletedItems')
        .then(({data}) => {
            setDivision(data.AllDivisions)
            setCities(data.AllCities)
            setLocation(data.AllLocation)
            setDepartments(data.AllDepartments)
            setBranches(data.ALLBranch)
            setDeletedTitles(data.Deleted_titles)
            setDeletedCities(data.Deleted_cities)
            setDeletedBranches(data.Deleted_location)
            setDeletedDivisions(data.Deleted_divisions)
            setDeletedDepartments(data.Deleted_department)
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


    const inputChange = (type) => {
        if(loading) return;
        if (typeof setSelected === 'function') {
            setSelected([]);
        }
        setEntries([])
        switch(type){
            case "division":
                setEntries(deletedDivisions)
                setLoading(false)
            break;
            case "department":
                setEntries(deletedDepartments.filter(div => div.division_id === division) || [])
                setLoading(false)
            break;
            case "title":
                // const selectedDivision = divisions.find((div)=> div.id === division);
                // if(!selectedDivision?.departments.some((dept)=> dept.id === department)){
                //     setdepartment(selectedDivision?.departments[0]?.id)
                //     setLevel(career_level[5]?.id)
                // }

                // const selectedDepartment = selectedDivision?.departments.find((dept)=> dept.id === department);
                setEntries(deletedTitles.filter((t) => t.department_id === department && t.career_level_id === level) || []);
                setLoading(false)
            break;
            case "city":
                setEntries(deletedCities)
                setLoading(false)
            break;
            case "branch":
                setEntries(deletedBranches.filter(c => c.city_id === city) || []);
                setLoading(false)
            break;
            default:
                setLoading(true)
            break;
        }
    }

    const handleRestore = () => {
        if (processing) return;
        setAction("");
        setProcessing(true);

        const restorePromise = () =>
            axiosClient.post('/inputs/bulk', {
                data: selected,
                type: inputs,
                action: "restore"
            }).then(res => {
                handleGetDeleted();
                fetchOptions();
                inputChange(inputs);
                setProcessing(false);
                setLoading(true)
                setSelected([]);
                return res.data; // pass response for toast
            });

        toast.promise(restorePromise(), {
            loading: 'Restoring items...',
            success: (data) => `Successfully restored ${data.length || selected.length} items!`,
            error: 'Failed to restore items.',
        });
    };

     const handlDelete = () => {
        if (processing) return;
        setAction("");
        setProcessing(true);

        const restorePromise = () =>
            axiosClient.post('/inputs/bulk', {
                data: selected,
                type: inputs,
                action: "delete"
            }).then(res => {
                handleGetDeleted();
                fetchOptions();
                inputChange(inputs);
                setProcessing(false);
                setLoading(true)
                setSelected([]);
                return res.data; // pass response for toast
            });

        toast.promise(restorePromise(), {
            loading: 'Restoring items...',
            success: (data) => `Successfully deleted ${data.length || selected.length} items!`,
            error: 'Failed to restore items.',
        });
    };


    useEffect(()=>{
        setLoading(true)
        inputChange(inputs)
    },[inputs, department, division, city, level, deletedDivisions, fetchOptions,])

    return(
        <>
        <div className="grid grid-rows-[min-content_1fr]">
            <div className="flex flex-row justify-between">

                <div className="flex flex-row gap-1">
                {
                    inputs === "department" || inputs === "title" ?
                    <>
                        <Select value={division} onValueChange={(value) => {setdivision(value);}} disabled={loading}>
                            {/* ${fetching ? "opacity-50 hover:cursor-not-allowed":""} */}
                            <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary  w-60 h-full bg-white text-base`}>
                                <SelectValue placeholder="Select Divsion" />
                            </SelectTrigger>
                            <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                {
                                    divisions?.map((d) => (
                                        <SelectItem value={d.id}>{d.division_name}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </>: null
                }
                {
                    inputs === "title" ?
                    <>
                        <Select value={department} onValueChange={(value) => {setdepartment(value);}} disabled={loading}>
                            {/* ${fetching ? "opacity-50 hover:cursor-not-allowed":""} */}
                            <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary  w-64 h-full bg-white text-base`}>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                {
                                    departments?.filter(dept => dept.division_id === division).map((d) => (
                                        <SelectItem value={d.id}>{d.department_name}</SelectItem>
                                    ))
                                }
                            </SelectContent>

                        </Select>
                    </>:null
                }
                {
                    inputs === "title" ?
                    <Select value={level} onValueChange={(value) => {setLevel(value);}} disabled={loading}>
                        {/* ${fetching ? "opacity-50 hover:cursor-not-allowed":""} */}
                        <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary  w-64 h-full bg-white text-base`}>
                            <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                            {
                                career_level.map((d) => (
                                    <SelectItem value={d.id}>{d.name}</SelectItem>
                                ))
                            }
                        </SelectContent>

                    </Select>:null

                }
                {
                    inputs === "branch"?
                    <>
                        <Select value={city} onValueChange={(value) => {setCity(value);}} disabled={loading}>
                            {/* ${fetching ? "opacity-50 hover:cursor-not-allowed":""} */}
                            <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary  w-64 h-full bg-white text-base`}>
                                <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                {
                                    cities.map((d) => (
                                        <SelectItem value={d.id}>{d.city_name}</SelectItem>
                                    ))
                                }
                            </SelectContent>

                        </Select>
                    </>:null
                }
                </div>
            </div>

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
                                                {e.division_name || e.department_name || e.title_name || e.city_name || e.branch_name || "No name given"}
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

        <AddFormInputModal isOpen={add} onClose={()=>setAdd(false)} formInput={formInput} fetchOptions={()=>fetchOptions()}/>
        {/* <EditFormInputModal open={edit} close={()=>setEdit(false)} formInput={formInput} formInputEntry={entry}/> */}
        {/* <DeleteFormInputModal open={_delete} close={()=>setDelete(false)} formInput={formInput} type={inputs} fetchOptions={()=>fetchOptions()}/> */}
        <WarningModal open={action === "restore" || action === "delete" } close={()=>setAction("")} title={action === "restore" ? "Restoring Entries" : "Permanently Deleting Inputs"} desc={action === "restore" ? "Are you sure you want to restore the following selected Entries" : "Are you sure to delete the following entry"} selected={selected} 
            proceed={()=>{if(action === "restore") {
                handleRestore()
                }  else {
                    handlDelete()
                }
            }}/>

        </>
    )
}
export default DeletedFormInput
