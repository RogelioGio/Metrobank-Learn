import { faCheckSquare, faChevronLeft, faChevronRight, faFilter, faPenToSquare, faPlus, faSpinner, faTrash, faUserLock, faUsers } from "@fortawesome/free-solid-svg-icons"
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
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import WarningModal from "../WarningModal";
import axios from "axios";
import axiosClient from "MBLearn/src/axios-client";
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

const FormInputSetting = ({inputs, selected, setSelected, action ,setAction}) => {
    const {user} = useStateContext()
    const {departments, titles, cities, location, divisions, career_level,  archivedDepartmentAndDivision_Title, archivedDivision_Departments,fetchOptions} = useOption();
    const [department, setdepartment] = useState();
    const [division, setdivision] = useState();
    const [city, setCity] = useState()
    const [level, setLevel] = useState()
    const [entries, setEntries] = useState([]);

    const [loading, setLoading] = useState(true)
    const [add, setAdd] = useState(false)
    const [edit, setEdit] = useState(false)
    const [_delete, setDelete] = useState(false)
    const [entry, setEntry] = useState()
    const [formInput, setFormInput] = useState()
    const [branches, setBranches] = useState()
    const [processing, setProcessing] = useState(false)

    // const { currentPaginated: currentDivision, indexFirstItem: fromDivision, indexLastItem: toDivision, totalitem: totalDivision, next: nextDivision, back: backDivision ,goto: gotoDivision, currentPage: currentPageDivision, totalPage: TotalPageDivision } = usePagination(division, 5);
    // const { currentPaginated: currentDepartment, indexFirstItem: fromDepartment, indexLastItem: toDepartment, totalitem: totalDepartment, next: nextDepartment, back: backDepartment ,goto: gotoDepartment, currentPage: currentPageDepartment, totalPage: TotalPageDepartment } = usePagination(departments, 5);

    // const { currentPaginated: currentSection, indexFirstItem: fromSection, indexLastItem: toSection, totalitem: totalSection, next: nextSection, back: backSection ,goto: gotoSection, currentPage: currentPageSection, totalPage: TotalPageSection } = usePagination(section, 5);
    // const { currentPaginated: currentCity, indexFirstItem: fromCity, indexLastItem: toCity, totalitem: totalCity, next: nextCity, back: backCity ,goto: gotoCity, currentPage: currentPageCity, totalPage: TotalPageCity } = usePagination(cities, 5);
    // const { currentPaginated: currentBranch, indexFirstItem: fromBranch, indexLastItem: toBranch, totalitem: totalBranch, next: nextBranch, back: backBranch ,goto: gotoBranch, currentPage: currentPageBranch, totalPage: TotalPageBranch } = usePagination(branches, 5);

    // useEffect(() => {
    //     handleRelatedCityAndBranch(''); // Load the entire location list on initial render
    // }, [location]);

    // useEffect(()=>{
    //     console.log(divisions)
    //     setLoading(false)
    // },[departments,titles,cities,location,division,division])

    // const handleRelatedCityAndBranch = (cityId) => {
    //     if(cityId == '') {
    //         setBranches(location)
    //         gotoBranch(1)
    //     } else {
    //         const selectedBranches = location.filter((l) => l.city_id == cityId)
    //         setBranches(selectedBranches)
    //         gotoBranch(1)
    //     }
    // }

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

    const handleFormInput = (input) => {
        setFormInput(input)
        setAdd(true)
    }

    const handleEditFormInput = ({input, entry}) => {
        setFormInput(input)
        setEntry(entry)
        setEdit(true)
    }

    const handleDeleteFormInput = (input) => {
        setFormInput(input)
        setDelete(true)
    }


    const inputChange = (type) => {
        if(loading && (!departments && !titles && !cities && !location && !divisions && !career_level)) return;
        if (typeof setSelected === 'function') {
            setSelected([]);
        }
        switch(type){
            case "division":
                setEntries(divisions.filter((div) => div.archived === false) ?? [])
                setLoading(false)
            break;
            case "department":
                setEntries(divisions.filter((div) =>  div.archived === false).find((div) => div.id == division)?.departments.filter((dept) => dept.archived === false)         )
                setLoading(false)
            break;
            case "title":
                const selectedDivision = divisions.find((div)=> div.id === division);
                    if(!selectedDivision?.departments.some((dept)=> dept.id === department)){
                        setdepartment(selectedDivision?.departments[0]?.id)
                        setLevel(career_level[5]?.id)
                    }

                    const selectedDepartment = selectedDivision?.departments.find((dept)=> dept.id === department);

                    setEntries(selectedDepartment?.titles?.filter(l => l.career_level_id === level) ?? []);
                    setLoading(false);
            break;
            case "city":
                setEntries(cities)
                setLoading(false)
            break;
            case "branch":
                setEntries(location.filter((loc) => loc.city_id === city) ?? [])
                setLoading(false)
            break;
            default:
                setLoading(true)
            break;
        }
    }

    useEffect(()=>{
        setLoading(true)
        inputChange(inputs)
    },[inputs, department, division, city, level,fetchOptions])


    const handleDelete = () => {
        if(processing) return;
        setAction("");
        setProcessing(true);

        const archivePromise = () =>
        axiosClient.post('/inputs/bulk', {
            data: selected,
            type: inputs,
            action: "archive"
        }).then(res => {
            fetchOptions();
            inputChange(inputs);
            setProcessing(false);
            setSelected([])
            setLoading(true)
            return res.data;
        }); // return the data for success toast

        toast.promise(archivePromise(), {
            loading: 'Processing...',
            success: (data) => `Successfully deleted ${data.length || selected.length} items!`,
            error: 'Failed to archive items',
        });
    }



    return(
        <>
        <div className="grid grid-rows-[min-content_1fr]">
            <div className="flex flex-row justify-between">
                {
                    user.user_infos.permissions?.some((permission)=> permission.id === 7) ?
                    <div className="px-5 py-2 flex flex-row bg-primary rounded-md items-center gap-4 font-header text-white hover:bg-primaryhover hover:cursor-pointer transition-all ease-in-out"
                        onClick={()=>setAdd(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        <p>Add Input</p>
                    </div> : null
                }

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
                                    divisions.filter((div) => div.archived === false)?.map((d) => (
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
                                    divisions.filter((div) => div.archived === false).find(d=> d.id === division)?.departments.filter((dep) => dep.archived === false).map((d) => (
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
                            <th className='py-4 px-4 uppercase hidden md:table-cell'>Date-added</th>
                            <th className='py-4 px-4 uppercase hidden md:table-cell'></th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-divider'>
                        {
                            loading ? (
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
                            )
                            : entries?.length == 0 ?
                                <tr>
                                    <td colSpan={3} className="py-4 gap-x-2 w-full">
                                        <div className="flex flex-col justify-center items-center w-full">
                                            <p className="font-text text-xs">No Entries Found</p>
                                        </div>
                                    </td>
                                </tr>
                            : entries?.map((e) => (
                                <tr key={e.id} className={`font-text text-md hover:bg-gray-200 cursor-pointer ${selected.find((entry) => entry.id === e.id) ? "bg-gray-200":""}`}  onClick={()=>{handleSelected(e.id)}}>
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
                                                {e.created_at ? format(new Date(e.created_at), "MMMM dd yyyy"):"No date given"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="flex-row gap-2 justify-end px-4 py-2 hidden md:flex">
                                        {
                                            user.user_infos.permissions?.some((permission)=> permission.id === 9) ?
                                            <div className='aspect-square w-10 flex flex-row justify-center items-center bg-white border-2 border-primary rounded-md shadow-md text-primary hover:text-white hover:cursor-pointer hover:scale-105 hover:bg-primary ease-in-out transition-all'
                                                onClick={(event)=>{event.stopPropagation(); setEdit(true); setEntry(e)}}
                                                >
                                                <FontAwesomeIcon icon={faPenToSquare} className='text-sm'/>
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
        <EditFormInputModal open={edit} close={()=>setEdit(false)} formInput={inputs} formInputEntry={entry} fetchOptions={()=>fetchOptions()}/>
        {/* <DeleteFormInputModal open={_delete} close={()=>setDelete(false)} formInput={formInput} type={inputs} fetchOptions={()=>fetchOptions()}/> */}
        <WarningModal open={action === "delete"} close={()=>setAction("")} title={"Deleting Entries"} desc={"Are you sure you want to delete the following selected Entries"} selected={selected} proceed={()=>{handleDelete()}}/>
        </>
    )
}
export default FormInputSetting
