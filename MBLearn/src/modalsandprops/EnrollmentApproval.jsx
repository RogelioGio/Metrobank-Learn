import { faChevronLeft, faChevronRight, faFilter, faPersonCirclePlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet"
import UserFilterProps from "./UserFilterProps";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { useEffect, useState } from "react";

const EnrollmentApproval = ({}) => {

    const filterformik = useFormik({
        initialValues: {
            division: '',
            department: '',
            section: '',
            branch: '',
            city:'',
            title:'',
            careerLevel:'',
        },
        validationSchema: Yup.object({
            department: Yup.string(),
            city: Yup.string(),
            branch: Yup.string(),
        }),
        onSubmit: values => {
            console.log(values)
            // setLoading(true)
            // setIsFiltered(true); // Set to true when filtered
            // axiosClient.get(`/index-user?division_id[eq]=${values.division}&department_id[eq]=${values.department}&section_id[eq]=${values.section}&branch_id[eq]=${values.branch}`)
            // .then((res) => {
            //     setUsers(res.data.data);
            //     setLoading(false)
            // }).catch((err) => {console.log(err)})
        }
    })

    const [pageState, setPagination] = useState({
            currentPage: 1,
            perPage: 12,
            total: 0,
            lastPage:1,
            startNumber: 0,
            endNumber: 0,
            currentPerPage:0
        });

        const pageChangeState = (key, value) => {
            setPagination ((prev) => ({
                ...prev,
                [key]: value
            }))
        }

        useEffect(() => {
                pageChangeState('startNumber', (pageState.currentPage - 1) * pageState.perPage + 1)
                pageChangeState('endNumber', Math.min(pageState.currentPage * pageState.perPage, pageState.total))
            },[pageState.currentPage, pageState.perPage, pageState.total])

            //Next and Previous
            const back = () => {
                if (learnerLoading) return;
                if (pageState.currentPage > 1){
                    pageChangeState("currentPage", pageState.currentPage - 1)
                    pageChangeState("startNumber", pageState.perPage - 4)
                }
            }
            const next = () => {
                if (learnerLoading) return;
                if (pageState.currentPage < pageState.lastPage){
                    pageChangeState("currentPage", pageState.currentPage + 1)
                }
            }

            const Pages = [];
            for(let p = 1; p <= pageState.lastPage; p++){
                Pages.push(p)
            }

            const pageChange = (page) => {
                if(learnerLoading) return;
                if(page > 0 && page <= pageState.lastPage){
                    pageChangeState("currentPage", page)
                }
            }

            // useEffect(() => {
            //    // handleLearnerChange(course.id)
            // },[pageState.currentPage, course.id])


    return (
        <div className="grid grid-cols-4 grid-rows-[min-content_1fr_min-content] gap-2 h-full">
            <div className=' inline-flex flex-row place-content-between border-2 border-primary rounded-md w-full font-text shadow-md'>
                <div className='bg-primary py-2 px-4 text-white'>
                    <FontAwesomeIcon icon={faSearch}/>
                </div>
                <input type="text" className='focus:outline-none text-sm px-4 w-full rounded-md bg-white' placeholder='Search...'/>
            </div>
            <div className="flex flex-col justify-center">
                <Sheet>
                <SheetTrigger>
                <div className='min-h-11 min-w-11 w-11 h-11 border-primary border-2 rounded-md shadow-md flex items-center justify-center text-primary hover:cursor-pointer hover:bg-primaryhover hover:border-primaryhover hover:text-white transition-all ease-in-out bg-white'>
                    <FontAwesomeIcon icon={faFilter} className='p-2'/>
                </div>
                </SheetTrigger>
                <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all" />
                <SheetContent className="h-full flex-col flex">
                                    <SheetTitle className="font-header text-2xl text-primary mb-1 sr-only">User Filters</SheetTitle>
                                    <SheetDescription className="text-sm text-unactive mb-5 sr-only">Categorize user with the given parameters</SheetDescription>

                                    <div>
                                        <h1 className='font-header text-2xl text-primary'>User Filter</h1>
                                        <p className='text-md font-text text-unactive text-sm'>Categorize user with the given parameters</p>
                                    </div>
                                    <UserFilterProps formik={filterformik}/>

                                </SheetContent>
                </Sheet>
            </div>
            <div className="col-start-4">
                <div className="font-header text-lg flex flex-row gap-2 items-center justify-center bg-primary w-full h-full text-white rounded-md">
                    <FontAwesomeIcon icon={faPersonCirclePlus}/>
                    <p>Approve</p>
                </div>
            </div>
            <div className="col-span-3 p-4 grid border-divider border rounded-md bg-white">

            </div>
            <div className="row-span-2 border-divider border rounded-md bg-white p-4 h-[calc(100vh-9.5rem)]">

            </div>
            <div className="col-span-3 h-full flex flex-row items-center justify-between py-3 pl-3 md:pl-0">
                <div>
                    {
                        true ? <p className='text-sm font-text text-unactive'>
                        Retrieving Learner to be enrolled...
                        </p> :
                        <p className='text-sm font-text text-unactive'>
                            Showing <span className='font-header text-primary'>{pageState.startNumber}</span> to <span className='font-header text-primary'>{pageState.endNumber}</span> of <span className='font-header text-primary'>{pageState.total}</span> <span className='text-primary'>results</span>
                        </p>
                    }
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
                                true ? (
                                    <a className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset`}>...</a>
                                ) : (
                                    Pages.map((page)=>(
                                        <a
                                            key={page}
                                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-header ring-1 ring-divider ring-inset
                                                ${
                                                    page === pageState.currentPage
                                                    ? 'bg-primary text-white'
                                                    : 'bg-secondarybackground text-primary hover:bg-primary hover:text-white'
                                                } transition-all ease-in-out`}
                                                onClick={() => pageChange(page)}>
                                            {page}</a>
                                    ))
                                )
                            }
                            <a
                                onClick={next}
                                className='relative inline-flex items-center rounded-r-md px-3 py-2 text-primary ring-1 ring-divider ring-inset hover:bg-primary hover:text-white transition-all ease-in-out'>
                                <FontAwesomeIcon icon={faChevronRight}/>
                            </a>
                        </nav>
                    </div>
                </div>
        </div>
    )
}

export default EnrollmentApproval;
