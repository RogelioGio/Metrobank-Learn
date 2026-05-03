import { faCheckSquare, faChevronLeft, faChevronRight, faPenToSquare, faPlus, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format, set } from "date-fns";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { useCourseContext } from "MBLearn/src/contexts/CourseListProvider";
import React, { useEffect } from "react";
import { useState } from "react";
import AddCourseFormInput from "../AddCourseFormInput";
import axios from "axios";
import axiosClient from "MBLearn/src/axios-client";
import DeleteCourseFormInput from "./DeletedCourseFormInput";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import WarningModal from "../WarningModal";
import { toast } from "sonner";

//Front end Pagination
const usePagination = (data, itemPerpage = 2) => {
    const [currentPage, setCurrentPage] = useState(1);
    const indexFirstItem = (currentPage - 1) * itemPerpage;
    const indexLastItem = Math.min(indexFirstItem + itemPerpage, data?.length);
    const currentPaginated = data?.slice(indexFirstItem, indexLastItem)
    const totalPage = Math.ceil(data?.length / itemPerpage)
    const totalitem = data?.length

    //Pagination Controll
    const goto = (pageNum) => {
        if (pageNum >= 1 && pageNum <= totalPage) setCurrentPage(pageNum);
    }
    const next = () => {
        // setCurrentPage((prev) => Math.min(prev + 1, totalPage));
        if (currentPage < totalPage) setCurrentPage(currentPage + 1)
    };

    const back = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return {
        currentPaginated,
        currentPage,
        totalPage,
        indexFirstItem,
        indexLastItem,
        totalitem,
        goto,
        next,
        back
    }
}

const CourseFormInputSetting = ({setSelected, selected, action, setAction}) => {
    // const {coursetypes, coursecategories} = useCourseContext()
    const [loading, setLoading] = useState()
    const [openAdd, setOpenAdd] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [categories, setCategories] = useState([]);
    const [formInput, setFormInput] = useState({})
    const [processing, setProcessing] = useState(false)

    const formInputs = () => {
        setLoading(true)
        axiosClient.get('/category/add')
        .then((res)=>{
            setCategories(res.data)
            setLoading(false)
        }).
        catch((err)=>console.log(err))
    }
    useEffect(()=>{
        formInputs()
    },[])

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

    const handleDelete = () => {
        if(processing) return;
        setAction("")
        setProcessing(true)

        const archivePromise = () =>
        axiosClient.post('/inputs/bulk', {
            data: selected,
            type: "category",
            action: "archive"
        }).then(res => {
            formInputs();
            setProcessing(false);
            setSelected([]);
            return res.data;
        }); // return the data for success toast

        toast.promise(archivePromise(), {
            loading: 'Processing...',
            success: (data) => data.message || `Successfully deleted ${selected.length} items!`,
            error: 'Failed to archive items',
        });
    }



    return(
        <>
            <div className="flex flex-col gap-5">
                {/* Course Category */}
                <div className="row-span-1 col-span-2 flex flex-col gap-5  pb-4">
                    {/* Header */}
                    <div className="flex flex-row justify-end">
                        <div className="group relative">
                            <div className={`flex flex-row justify-center items-center border-2 border-primary font-header bg-secondarybackground rounded-md text-primary gap-5 hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out shadow-md
                                            w-10 h-10
                                            md:py-2 md:px-8 md:h-full md:w-full`}
                                onClick={() => {setOpenAdd(true)}}
                                >
                                <FontAwesomeIcon icon={faPlus}/>
                                <p className="md:flex hidden">Add Course Category</p>
                            </div>
                            <div className="md:hidden absolute text-center top-12 right-0 font-text text-xs bg-tertiary p-2 shadow-md rounded-md text-white whitespace-nowrap scale-0 group-hover:scale-100 transition-all ease-in-out">
                                Add Course Category
                            </div>
                        </div>
                    </div>
                    <div className="w-full border-primary border rounded-md overflow-hidden shadow-md">
                        <table className='text-left w-full overflow-y-scroll'>
                            <thead className='font-header text-xs text-primary bg-secondaryprimary'>
                                <tr>
                                    <th className='py-4 px-4 uppercase'>Course Category Name</th>
                                    <th className='py-4 px-4 uppercase md:table-cell hidden'>Date-added</th>
                                    <th className='py-4 px-4 uppercase md:table-cell hidden'></th>
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
                                            <td colSpan={3} className="md:table-cell hidden py-4 ">
                                                <div className="flex flex-row items-center justify-center gap-x-2">
                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin ease-in-out"/>
                                                    <p className="font-text text-xs">Loading Items...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) :
                                    categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={1} className="flex flex-row items-center justify-center md:hidden py-4 gap-x-2">
                                                <p className="font-text text-xs">No Items Found</p>
                                            </td>
                                            <td colSpan={3} className="md:table-cell hidden py-4 ">
                                                <div className="flex flex-row items-center justify-center gap-x-2">
                                                    <p className="font-text text-xs">No Items Found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) :
                                    (
                                        categories.map((category)=>(
                                        <tr key={category.id} className={`font-text text-md hover:bg-gray-200 cursor-pointer ${selected?.find((entry) => entry.id === category?.id) ? "bg-gray-200" : ""}`} onClick={() => handleSelected(category.id)}>
                                            <td className={`font-text p-4 flex flex-row items-center gap-4 border-l-2 border-transparent transition-all ease-in-out`}>
                                                 <div className="w-fit cursor-pointer">
                                                    {
                                                        selected?.find((entry) => entry.id === category.id) ?
                                                        <FontAwesomeIcon icon={faCheckSquare} className="text-primary text-lg"/>
                                                        :
                                                        <FontAwesomeIcon icon={faSquare} className="text-unactive text-lg"/>
                                                    }

                                                </div>
                                                <p className="hidden md:flex text-xs">{category.category_name}</p>
                                                <div className="flex flex-col md:hidden">
                                                    <p>{category.category_name}</p>
                                                    <p className="text-xs font-text text-unactive">Date Added: {format(new Date(category.created_at), "MMMM dd, yyyy")}</p>
                                                </div>
                                                <div className="flex flex-row gap-2 md:hidden">
                                                    <div className='aspect-square w-10 flex flex-row justify-center items-center bg-white border-2 border-primary rounded-md shadow-md text-primary hover:text-white hover:cursor-pointer hover:scale-105 hover:bg-primary ease-in-out transition-all'
                                                    //</td> onClick={() => handleEditFormInput({ input: "Division", entry: division })}
                                                        >
                                                        <FontAwesomeIcon icon={faPenToSquare} className='text-sm'/>
                                                    </div>
                                                    <div className='aspect-square w-10 flex flex-row justify-center items-center bg-white border-2 border-primary rounded-md shadow-md text-primary hover:text-white hover:cursor-pointer hover:scale-105 hover:bg-primary ease-in-out transition-all'
                                                        //</tbody>onClick={()=>handleDeleteFormInput("Division",division)}
                                                        >
                                                        <FontAwesomeIcon icon={faTrash} className='text-sm'/>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`font-text p-4 gap-4 transition-all ease-in-out text-xs md:table-cell hidden`}>{format(new Date(category.created_at), "MMMM dd, yyyy")}</td>
                                            <td className="flex-row gap-2 justify-end py-2 px-4 md:flex hidden">
                                                <div className='aspect-square w-10 flex flex-row justify-center items-center bg-white border-2 border-primary rounded-md shadow-md text-primary hover:text-white hover:cursor-pointer hover:scale-105 hover:bg-primary ease-in-out transition-all'
                                                    //</tbody>onClick={()=>handleDeleteFormInput("Division",division)}
                                                    onClick={()=>{
                                                        setFormInput(category)
                                                        setOpenDelete(true)
                                                    }}>
                                                    <FontAwesomeIcon icon={faTrash} className='text-sm'/>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddCourseFormInput open={openAdd} close={()=>{setOpenAdd(false)}} fetch={()=>{formInputs()}}/>
            {/* <DeleteCourseFormInput open={openDelete} close={()=>{setOpenDelete(false)}} formInput={formInput} fetch={()=>{formInputs()}}/> */}
            <WarningModal open={action === "delete"} close={()=>setAction("")} title={"Deleting Entries"} desc={"Are you sure you want to delete the following selected Entries"} selected={selected} proceed={()=>{handleDelete()}}/>

        </>
    )
}
export default CourseFormInputSetting;
