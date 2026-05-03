import { createContext, useEffect, useState, useContext } from "react";
import axiosClient from "../axios-client";

const AuthroingToolContext = createContext();

export const AuthoringToolProvider = ({children}) => {
    const [options, setOptions] = useState({
        categories:[],
        department:[],
        career_level:[],
    });


    const fetchOptions = () => {
        axiosClient.get("/optionAuthoring")
        .then((res) => {
            setOptions(res.data);
        }).catch((err) => console.log(err))
    }

    useEffect(()=>{
        fetchOptions();
    },[]);

    return(
        <AuthroingToolContext.Provider value={options}>
            {children}
        </AuthroingToolContext.Provider>
    )
}

export const useAuthoringTool = () => useContext(AuthroingToolContext);
