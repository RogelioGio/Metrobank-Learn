import { Children, createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../axios-client";

const CarouselContent = createContext();

export const CarouselContentProvider = ({children}) => {
    const [carousels, setCarousels] = useState([])
    const _setCarousel = (carousel) => {
        setCarousels(carousel)
    }

    useEffect(()=>{
        axiosClient.get('/carousels')
                .then(({data}) => {
                    setCarousels(data)
                }).catch((error) => {
                    console.log("Error", error)
                })
    },[])

    return(
        <CarouselContent.Provider value={{carousels, _setCarousel}}>
            {children}
        </CarouselContent.Provider>
    )
}
export const useCarouselContext = () => useContext(CarouselContent)
