import { faBookOpenReader, faChevronLeft, faChevronRight, faUserPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { useState } from "react";


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


const AssignCourseAdminModalSuccessfully = ({number, open, close, result}) => {
    const {currentPaginated,
    currentPage,
    totalPage,
    indexFirstItem,
    indexLastItem,
    totalitem,
    goto,
    next,
    back} = usePagination(result,5)

    return(
        <Dialog open={open} onClose={()=>{}}>
            <DialogBackdrop transition className="backdrop-blur-sm fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-30"/>
            <div className='fixed inset-0 z-30 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel transition className='relative overflow-hidden transform rounded-md bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                                                        w-[100vw]
                                                        md:w-[80vw]'>

                        <div className='bg-white rounded-md h-full p-5 flex flex-col'>
                            {/* Header */}
                                <div className="pb-2 mx-4 border-b border-divider flex flex-row justify-between item-center">
                                    <div className="">
                                        <h1 className="text-primary font-header
                                                text-base
                                                md:text-2xl">Assigned Successfully</h1>
                                        <p className="text-unactive font-text
                                                text-xs
                                                md:text-sm">The selected {number} users is successfuly assigned to as course admin</p>
                                    </div>
                                </div>

                                <div className="px-4 pt-2">
                                    <div className='w-full border-primary border rounded-md overflow-hidden shadow-md'>
                                    <table className='text-left w-full overflow-y-scroll'>
                                        <thead className='font-header text-xs text-primary bg-secondaryprimary'>
                                            <tr>
                                                <th className='py-4 px-4'>EMPLOYEE NAME</th>
                                                <th className='py-4 px-4 hidden lg:table-cell'>DIVISION</th>
                                                <th className='py-4 px-4 hidden lg:table-cell'>DEPARTMENT</th>
                                                <th className='py-4 px-4 hidden lg:table-cell'>SECTION</th>
                                            </tr>
                                        </thead>
                                        <tbody className='bg-white divide-y divide-divider'>
                                            {currentPaginated?.map((user, index) => (
                                                <tr key={index} className='hover:bg-gray-100 transition-all ease-in-out'>
                                                    <td className='text-sm py-3 px-4'>
                                                        <div className="flex-row gap-x-2 items-center lg:flex hidden">
                                                            {/* User Image */}
                                                                {
                                                                    user?.profile_image ?
                                                                    <img src={user?.profile_image} alt="" className='rounded-full h-8 w-8'/>
                                                                    : <div className="bg-blue-500 h-10 w-10"></div>
                                                                }

                                                            {/* Name and employee-id*/}
                                                            <div>
                                                                <p className='font-text text-xs'>{user?.first_name} {user?.middle_name || ""} {user?.last_name}</p>
                                                                <p className='text-unactive text-xs'>ID: {user?.employeeID}</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-3 grid-rows-[min-content_auto] gap-2 gap-y-3 lg:hidden">
                                                            <div className="flex flex-row gap-x-2 items-center col-span-4">
                                                                <img src={user?.profile_image} alt="" className='rounded-full h-8 w-8'/>
                                                                <div>
                                                                    <p className='font-text text-xs'>{user?.first_name} {user?.middle_name || ""} {user?.last_name}</p>
                                                                    <p className='text-unactive text-xs'>ID: {user?.employeeID}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className='font-text text-xs'>{user?.division.division_name}</p>
                                                                <p className='text-xs font-text text-unactive'>Division</p>
                                                            </div>
                                                            <div>
                                                                <p className='font-text text-xs'>{user?.department.department_name}</p>
                                                                <p className='text-xs font-text text-unactive'>Department</p>
                                                            </div>
                                                            <div>
                                                                <p className='font-text text-xs'>{user?.section.section_name}</p>
                                                                <p className='text-xs font-text text-unactive'>Section</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='py-3 px-4 hidden lg:table-cell'>
                                                        <p className='text-unactive text-xs font-text'>{user?.division.division_name}</p>
                                                    </td>
                                                    <td className="py-3 px-4 hidden lg:table-cell">
                                                        <p className='text-unactive text-xs font-text'>{user?.department.department_name}</p>
                                                    </td>
                                                    <td className="py-3 px-4 hidden lg:table-cell">
                                                        <p className='text-unactive text-xs font-text'>{user?.section.section_name}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>

                                {/* Pagination */}
                                <div className="px-4 pt-2 flex flex-row justify-between items-center">
                                    <div className='flex flex-row items-center gap-2'>
                                        <p className='text-sm font-text text-unactive'>
                                            Showing <span className='font-header text-primary'>{indexFirstItem + 1}</span> to <span className='font-header text-primary'>{indexLastItem}</span> of <span className='font-header text-primary'>{totalitem}</span> <span className='text-primary'>results</span>
                                        </p>
                                    </div>
                                        <div>
                                            <nav className='isolate inline-flex -space-x-px round-md shadow-xs'>
                                                {/* Previous */}
                                                <a
                                                    onClick={back}
                                                    className='relative inline-flex items-center rounded-l-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                    <FontAwesomeIcon icon={faChevronLeft}/>
                                                </a>

                                                {/* Current Page & Dynamic Paging */}
                                                {
                                                    Array.from({length: totalPage}, (_, i) => (
                                                        <a key={i}
                                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                                ${
                                                                    currentPage === i+1
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                                } transition-all ease-in-out`}
                                                                onClick={() => goto(i+1)}>
                                                            {i+1}</a>
                                                    ))
                                                }


                                                <a
                                                    onClick={next}
                                                    className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                                    <FontAwesomeIcon icon={faChevronRight}/>
                                                </a>
                                            </nav>
                                        </div>
                                </div>


                                <div className="flex flex-row justify-between gap-2 mx-4 py-2">
                                    <div className="text-center flex-col flex p-4 w-full bg-primary rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover ease-in-out transition-all"
                                        onClick={close}>
                                        <p className="font-header text-white">Confirm</p>
                                    </div>
                                </div>
                            </div>

                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
export default AssignCourseAdminModalSuccessfully
