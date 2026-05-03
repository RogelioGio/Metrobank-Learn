import { useEffect, useState } from "react";
import UploadPhotoModal from "../UploadPhotoModal";
import DeletePanelModal from "../DeletePanelModal";
import axiosClient from "MBLearn/src/axios-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faArrowLeft, faChevronLeft, faChevronRight, faImage, faMinus, faPlug, faPlus, faSave, faSort, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import * as React from "react";
import { format, set } from "date-fns";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from "MBLearn/src/components/ui/carousel";
import { useRef } from "react";
import LoginBackground2 from '../../assets/Login_Background2.png';
import { CarouselContentProvider, useCarouselContext } from "MBLearn/src/contexts/CarourselContext";
import {  Select,
            SelectTrigger,
            SelectValue,
            SelectContent,
            SelectItem
        } from 'MBLearn/src/components/ui/select';
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";


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

const SystemContentSetting = ({}) => {
    const [openUpload, setOpenUpload] = useState(false)
    const [panels, setPanels] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [destroy, setDestroy] = useState(false)
    const [deletingID, setDeletingID] = useState()
    const [currentPanel, setCurrentPanel] = useState(0)
    const carouselRef = useRef(null)
    const {_setCarousel, carousels} = useCarouselContext();
    const [type, setType] = useState("selected")
    const [selecting, setSelecting] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [deselecting, setDeselecting] = useState(false);
    const [proccessing, setProcessing] = useState(false)
    const [selectedPanels, setSelectedPanels] = useState([])


    //Carousel Pagination
    const {currentPaginated,
        currentPage,
        totalPage,
        indexFirstItem,
        indexLastItem,
        totalitem,
        goto,
        next,
        back} = usePagination(panels,5)

    const fetchPanels = () => {
            setIsLoading(true)
            axiosClient.get('/carousels')
            .then(({data}) => {
                setPanels(data)
                _setCarousel(data)
                setIsLoading(false)
            }).catch((err)=> {
                setIsLoading(false)
            })
        }

    useEffect(()=>{
        fetchPanels()
    },[])

    const openDelete = (id) => {
        setDestroy(true)
        setDeletingID(id)
    }

    const closeDelete = () => {
        setDestroy(false)
    }

    function ActivePanel() {
    const { api } = useCarousel();
    React.useEffect(() => {
        if (!api) return;

        const onSelect = () => {
        setCurrentPanel(api.selectedScrollSnap());

        };

        api.on("select", onSelect);
        onSelect();

        return () => {
        api.off("select", onSelect);
        };
    }, [api]);
    }

    const handleSelectingPanels  = (panel) => {
        setSelectedPanels((prev) => {
            const currentInedex = carousels.filter((p) => p.is_selected === true).length
            const exist = prev.find((p) => p.id === panel.id)

            if(exist){
                return prev.filter((p) => p.id !== panel.id)
            } else {
                return [...prev, {...panel, order_index: currentInedex + (prev.length + 1)}]
            }

        })
    }

    const selectingPanels = () => {
        setProcessing(true);
        axiosClient.put('/carouselimages/update',selectedPanels)
        .then(({data}) => {
            setProcessing(false);
            fetchPanels();
            setSelecting(false)
            setSelectedPanels([])
        }).catch((err) => {
            console.log(err);
        })
    }

    const handleReordering = (panel) => {
        setSelectedPanels((prev) => {
            const exist = prev.find((p) => p.id === panel.id);
            let updated

            if(exist){
                updated = prev.filter((p) => p.id !== panel.id)
            }else {
                updated = [...prev, panel]
            }

            return updated.map((p, index) => ({
                ...p,
                order_index: index + 1
            }))
        })
    }

    const reorderingPanels = () => {
        setProcessing(true);
        axiosClient.put('/carouselimages/reorder',selectedPanels)
        .then(({data}) => {
            setProcessing(false);
            fetchPanels();
            setReordering(false)
            setSelectedPanels([])
        }).catch((err) => {
            console.log(err);
        })
    }

    useEffect(() => {
        console.log(selectedPanels)
    }, [selectedPanels])



    const items = (
        <div className="w-full border-primary border rounded-md overflow-hidden shadow-md">
                        <table className='text-left w-full overflow-y-scroll'>
                            <thead className='font-header text-xs text-primary bg-secondaryprimary'>
                                <tr>
                                    <th className='py-4 px-4 uppercase'>Panel Name</th>
                                    <th className='py-4 px-4 uppercase md:table-cell hidden'>Date-added</th>
                                    <th className='py-4 px-4 uppercase md:table-cell hidden'></th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-divider'>
                                {
                                    isLoading ? (
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
                                    ) : (
                                        currentPaginated?.map((panel, index) => (
                                            <tr key={panel.id} className={`font-text text-md hover:bg-gray-200 cursor-pointer`}>
                                                <td className={`font-text px-4  py-2 flex flex-row justify-between items-center gap-4 border-l-2 border-transparent transition-all ease-in-out`}>
                                                    <p className="md:block hidden">{panel.image_name}</p>
                                                    <div className="flex flex-col md:hidden">
                                                        <p>{panel.image_name}</p>
                                                        <p className="text-xs font-text text-unactive">Date-Added:  {panels?.length > 0 ? null : panels[currentPanel]?.created_at ?
                                                            format(new Date(panels[currentPanel].created_at), "MMMM dd yyyy")
                                                            : "Loading"}</p>
                                                    </div>
                                                    <div className="md:hidden">
                                                        <div className='aspect-square w-10 flex flex-row justify-center items-center bg-white border-2 border-primary rounded-md shadow-md text-primary hover:text-white hover:cursor-pointer hover:scale-105 hover:bg-primary ease-in-out transition-all'
                                                            onClick={()=> openDelete(panel.id)}>
                                                            <FontAwesomeIcon icon={faTrash} className='text-sm'/>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`font-text px-4 py-2 gap-4 transition-all ease-in-out hidden md:table-cell text-unactive`}>{format(new Date(panel.created_at), "MMMM dd, yyyy")}</td>
                                                <td className="flex-row gap-2 justify-end px-4 py-2 md:flex hidden">
                                                    <div className='aspect-square w-10 flex flex-row justify-center items-center bg-white border-2 border-primary rounded-md shadow-md text-primary hover:text-white hover:cursor-pointer hover:scale-105 hover:bg-primary ease-in-out transition-all'
                                                        onClick={()=> openDelete(panel.id)}>
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
    )

    const items2 = (
         <CarouselContentProvider>
        <>
            <div className="pb-5 border-b border-divider">
                <div className="flex flex-row justify-between items-center pb-5">
                    <div>
                        <h1 className="font-header text-primary text-base">Customize Announcement Panels</h1>
                        <p className="font-text text-unactive text-xs">Upload and manage announcement panel to be used in the system</p>
                    </div>
                    <div className="relative group">
                        <div className="flex flex-row justify-center items-center border-2 border-primary font-header bg-secondarybackground rounded-md text-primary gap-5 hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out shadow-md
                                        h-10 w-10
                                        md:py-2 md:px-8 md:h-full md:w-full"
                            onClick={() => setOpenUpload(true)}>
                            <FontAwesomeIcon icon={faAdd}/>
                            <p className="md:block hidden"> Add Panel </p>
                        </div>
                        <div className="md:hidden absolute text-center top-12 right-0 font-text text-xs bg-tertiary p-2 shadow-md rounded-md text-white whitespace-nowrap scale-0 group-hover:scale-100 transition-all ease-in-out">
                            Upload Panel
                        </div>
                    </div>
                </div>

                {/* Current Panels */}



                {/* Table for Announcement Panel */}
                <div className="pb-5">
                    <p className="font-text py-1 text-xs">List of the Current Panels:</p>
                    heeki
                </div>



            </div>
            <div>
                <div className="flex flex-row justify-between items-center pb-5 pt-5">
                    <div>
                        <h1 className="font-header text-primary text-base">Customize Login Background</h1>
                        <p className="font-text text-unactive text-xs">Manange to change the backdrop image at the login page interface</p>
                    </div>
                    <div className="relative group">
                        <div className="flex flex-row justify-center items-center border-2 border-primary font-header bg-secondarybackground rounded-md text-primary gap-5 hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out shadow-md
                                        h-10 w-10
                                        md:py-2 md:px-8 md:h-full md:w-full"
                            onClick={() => setOpenUpload(true)}>
                            <FontAwesomeIcon icon={faAdd}/>
                            <p className="md:block hidden"> Upload  </p>
                        </div>
                        <div className="md:hidden absolute text-center top-12 right-0 font-text text-xs bg-tertiary p-2 shadow-md rounded-md text-white whitespace-nowrap scale-0 group-hover:scale-100 transition-all ease-in-out">
                            Upload Panel
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="relative flex">
                    <div className="aspect-[3/1] border-2 border-primary rounded-md">
                        <img src={LoginBackground2} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white h-3/4 w-1/6 rounded-md shadow-md p-5 flex flex-col justify-between items-stretch">
                        <div>
                            <div className="h-2 w-4/5 bg-primary rounded-full mb-1"/>
                            <div className="h-2 w-1/2 bg-primary rounded-full"/>
                        </div>

                        <div>
                            <div className="w-full h-5 rounded-md bg-primary"/>
                        </div>

                    </div>
                </div>

                {/* Panel Detail */}
                {/* <div className="flex flex-col font-text text-xs py-2">
                    <p className="text-unactive">Active Panel Details</p>
                                        <p className="text-sm text-primary">{panels[currentPanel]?.image_name}</p>
                                        <p className="text-unactive">Date-Added: {format(new Date(panels[currentPanel]?.created_at),"MMMM dd yyyy")}</p>
                </div> */}

            </div>


        </>
        </CarouselContentProvider>
    )

    return (

        <>
            <div className="flex flex-col gap-2 col-span-2 w-full">
                <div className="flex flex-row w-full justify-between">
                    <div>
                        <h1 className="font-header text-primary text-base">Customize Announcement Panels</h1>
                        <p className="font-text text-unactive text-xs">Upload and manage announcement panel to be used in the system</p>
                    </div>
                    <div className="relative group">
                        <div className="flex flex-row justify-center items-center border-2 border-primary font-header bg-secondarybackground rounded-md text-primary gap-5 hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out shadow-md
                                        h-10 w-10
                                        md:py-2 md:px-8 md:h-full md:w-full"
                            onClick={() => setOpenUpload(true)}>
                            <FontAwesomeIcon icon={faAdd}/>
                            <p className="md:block hidden"> Add Panel </p>
                        </div>
                        <div className="md:hidden absolute text-center top-12 right-0 font-text text-xs bg-tertiary p-2 shadow-md rounded-md text-white whitespace-nowrap scale-0 group-hover:scale-100 transition-all ease-in-out">
                            Upload Panel
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Carousel plugins={[
                                                Autoplay({
                                                    delay: 10000,
                                                }),
                                            ]}
                                            opts={{
                                                align: "start",
                                                loop: true,
                                            }} className="flex flex-col gap-2">
                    {/* {
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div>
                                <h1 className="font-header text-primary text-base">Announcement Panel</h1>
                                <p className="font-text text-unactive text-xs">Latest update about the system and whole Metrobank Group</p>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <CarouselPrevious/>
                                <CarouselNext/>
                            </div>
                        </div>
                    } */}
                    <ActivePanel />
                    <p className="text-xs">Active Panels</p>
                    <CarouselContent>
                    {
                        carousels.length === 0 ?
                        <CarouselItem>
                        <div className="border-2 border-primary rounded-md aspect-[4/1] shadow-sm bg-white bg-center bg-cover min-h-40">
                        </div>
                        </CarouselItem>
                        :
                        carousels.filter((i)=>i.is_selected === true).map((img, index) => (
                                        <CarouselItem key={index}>
                                        {/* <div
                                            className="border-2 border-primary h-full rounded-md shadow-sm bg-white bg-center bg-cover"
                                            style={{
                                                backgroundImage: `url(${import.meta.env.VITE_API_BASE_URL}/storage/carouselimages/${img.image_path})`,
                                            }}
                                            >
                                        </div> */}
                                        {/* ${import.meta.env.VITE_API_BASE_URL}/storage/carouselimages/${img.image_path} */}
                                        <div className="border-2 border-primary rounded-md aspect-[4/1] shadow-sm bg-white bg-center bg-cover overflow-hidden flex items-center justify-center">
                                            <img src={img.image_path} alt="" />
                                        </div>
                                        </CarouselItem>
                        ))
                    }
                    </CarouselContent>
                    <div className="flex flex-row justify-between">
                        <div>
                            <p className="text-xs text-unactive">Active Panel Name:</p>
                            <p>{panels[currentPanel]?.image_name}</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <CarouselPrevious/>
                            <CarouselNext/>
                        </div>
                    </div>
                    </Carousel>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex flex-row justify-between">
                        <p className="font-text text-xs">List of Panels</p>
                        <p className="font-text text-xs">Actions</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <Select value={type} onValueChange={(value) => {setType(value);}} disabled={reordering || selecting}>
                            <SelectTrigger className={`focus:outline-2 focus:-outline-offset-2 focus:outline-primary border-primary border-2 font-header text-primary w-60 py-5 bg-white`}>
                                <SelectValue placeholder="Account Status" />
                            </SelectTrigger>
                            <SelectContent className="font-text text-xs text-primary hover:cursor-pointer">
                                <SelectItem value="selected">Active Panels</SelectItem>
                                <SelectItem value="unselected">Inactive Panels</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex flex-row gap-1">
                            <div className="flex flex-row items-center gap-2 mr-1">
                                {
                                    type === "unselected" && selecting ?
                                    <p className="font-text text-xs text-unactive flex items-center mr-2">Select panels you want to be active in the Announcement Panel</p>
                                    : type === "selected" && deselecting ?
                                    <p className="font-text text-xs text-unactive flex items-center mr-2">Select panels you want to remove in the Announcement Panel</p>
                                    : type === "selected" && reordering ?
                                    <p className="font-text text-xs text-unactive flex items-center mr-2">Reorder the panels by clicking the panel to the order you want</p>
                                    : null
                                }
                                {   reordering || selecting || deselecting ?
                                    <div className="bg-white text-primary border-2 border-primary rounded-md px-2 py-1 items-center gap-2 h-10 w-10 flex flex-row justify-center hover:cursor-pointer hover:text-white hover:bg-primaryhover  transition-all ease-in-out"
                                        onClick={()=> {
                                            setSelectedPanels([]);
                                            if(selecting){
                                                setSelecting(false)
                                            }else if(reordering){
                                                setReordering(false)
                                            } else {
                                                setDeselecting(false)
                                            }
                                        }}>
                                        <FontAwesomeIcon icon={faArrowLeft} className={``} />
                                    </div>
                                    : null
                                }
                            </div>

                            {
                                type === "selected" && !reordering && !selecting && !deselecting  ?
                                <div className="flex flex-row font-header bg-white px-10 py-2 rounded-md text-primary items-center border-primary border-2 hover:text-white hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out" onClick={()=>setDeselecting(true)}>
                                        <FontAwesomeIcon icon={faMinus} className="mr-2"/>
                                        <p>Remove Active Panel</p>
                                </div>
                                : null
                            }
                            {
                                type === "selected" && !reordering && !deselecting ?
                                <div className="flex flex-row font-header bg-primary px-10 py-2 rounded-md text-white items-center hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out" onClick={()=>setReordering(true)}>
                                    <FontAwesomeIcon icon={faSort} className="mr-2"/>
                                    <p>Reorder Panels</p>
                                </div>
                                :
                                (type === "selected" || type === "unselected") && (reordering || selecting || deselecting) ?
                                <div className={`flex flex-row font-header bg-primary px-10 py-2 rounded-md text-white items-center hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out ${proccessing ? "opacity-50 hover:cursor-not-allowed":""}`}
                                    onClick={()=>{
                                        if(proccessing) return;

                                        if((type === "unselected" || type === "selected") && (selecting || deselecting)){
                                            selectingPanels();
                                        } else if(type === "selected" && reordering){
                                            reorderingPanels();
                                        }
                                    }}>
                                    {
                                        proccessing ?
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin"/>
                                            <p>Saving Changes...</p>
                                        </>:
                                        <>
                                            <FontAwesomeIcon icon={faSave} className="mr-2"/>
                                            <p>Save Changes</p>
                                        </>
                                    }

                                </div>
                                : type === "unselected" && !selecting ?
                                <div className="flex flex-row font-header bg-primary px-10 py-2 rounded-md text-white items-center hover:cursor-pointer hover:bg-primaryhover transition-all ease-in-out" onClick={()=>setSelecting(true)}>
                                    <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                                    <p>Select Active Panels</p>
                                </div>
                                : null
                            }
                        </div>
                    </div>
                    <ScrollArea className="border border-divider rounded-md h-[calc(100vh-13rem)] bg-white">
                        <div className="flex p-4 flex-col gap-2">
                            {
                                carouselRef.length === 0 ? null :
                                carousels.filter(c => c.is_selected === (type === "selected")).map((i) => {
                                    const selected = selectedPanels.find((p) => p.id === i.id);

                                    return (
                                        <div className= {`border border-divider shadow-md rounded-md p-4 justify-between items-center flex flex-row ${selected && deselecting ? "bg-red-200 border-red-600 text-red-600 hover:border-red-600" : selected ? "bg-primarybg  border-primary text-primary": "bg-white"} hover:cursor-pointer hover:shadow-lg hover:border-primary transition-all ease-in-out`}
                                        onClick={()=>{
                                            if(proccessing) return;
                                            if(selecting || deselecting) {
                                                handleSelectingPanels(i)
                                            } else if(reordering){
                                                handleReordering(i)
                                            }
                                        }}>
                                        <div className="flex flex-row items-center justify-between gap-4 w-full">
                                            <div className="flex flex-row items-center gap-4">
                                                <div className="">
                                                    <FontAwesomeIcon icon={faImage} className={`text-2xl ${selected && deselecting ? "text-red-600" : selected ? "text-primary": "text-unactive"}`}/>
                                                </div>
                                                <div className="flex flex-col">
                                                    <p>{i.image_name}</p>
                                                    <p className="font-text  text-xs">Date Added: {i.created_at ? format(new Date(i.created_at), "MMMM dd yyyy"): null}</p>
                                                </div>
                                            </div>
                                            {
                                                reordering && selected ?
                                                <div className="w-10 h-10 border-primary bg-white border rounded-md flex items-center justify-center text-primary hover:bg-primary hover:cursor-pointer transition-all hover:text-white">
                                                    <p className="font-header text-primary text-xl">{selected.order_index}</p>
                                                </div>
                                                : null
                                            }
                                        </div>
                                        <div>
                                            {
                                                selecting || reordering || deselecting ? null :
                                                <div className="w-10 h-10 border-red-600 bg-red-300 border rounded-md flex items-center justify-center text-red-600 hover:bg-red-600 hover:cursor-pointer transition-all hover:text-white"
                                                    onClick={()=> openDelete(i.id)}>
                                                    <FontAwesomeIcon icon={faTrash}/>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    )
                                })
                            }
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <UploadPhotoModal open={openUpload} close={() => setOpenUpload(false)} refreshlist={fetchPanels}/>
            <DeletePanelModal open={destroy} close={closeDelete} refresh={fetchPanels} id={deletingID}/>
        </>
    )
}
export default SystemContentSetting;
