import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    } from "../../components/ui/carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import PhotoforCarouselModal from "../PhotoforCarouselModal";
import axiosClient from "MBLearn/src/axios-client";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import { useCarouselContext } from "MBLearn/src/contexts/CarourselContext";


const AnnouncmentCarousel = ({hideControls}) => {
    const [openAdd, setOpenAdd] = useState(false)
    const [carouselData, setCarouselData] = useState([])
    const [isLoading, setIsLoading] = useState()
    const {role} = useStateContext()
    const carousels = useCarouselContext()

    useEffect(() => {
        setIsLoading(true)
        if(carousels) {
            setCarouselData(carousels.carousels)
            setIsLoading(false)
        }
    }, [carousels])

    const fetchPanels = () => {
        setIsLoading(true)
        axiosClient.get('/carousels')
        .then(({data}) => {
            setCarouselData(data)
            setIsLoading(false)
        }).catch((error) => {
            console.log("Error", error)
            setIsLoading(false)
        })
    }


    return(
        <>
        <Carousel plugins={[
                            Autoplay({
                                delay: 10000,
                            }),
                        ]}
                        opts={{
                            align: "start",
                            loop: true,
                        }} className="flex flex-col gap-2">
            {/* Header */}
            {
                hideControls ? null :
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
            }
            <CarouselContent>
                {
                    carouselData.length === 0 || carouselData.filter((i)=>i.is_selected === true)?.length === 0  ?
                    <CarouselItem>
                    <div className="border-2 border-primary rounded-md aspect-[4/1] shadow-sm bg-white bg-center bg-cover min-h-40 flex items-center justify-center">
                        <p className="font-text text-unactive text-sm">No announcement available</p>
                    </div>
                    </CarouselItem>
                    :
                    carouselData.filter((i)=>i.is_selected === true).map((img, index) => (
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
        </Carousel>
        </>
    )
}
export default AnnouncmentCarousel;
