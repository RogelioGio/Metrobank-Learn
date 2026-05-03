import React from 'react'
import Error401 from "../assets/401_Error_Unauthorized-rafiki.svg";
import { useNavigate } from 'react-router';



export default function NotFound() {
    const navigate = useNavigate();

  return (
     <div className="bg-background w-screen h-screen flex items-center justify-center flex-col gap-3">
            <img src={Error401} alt="Unauthorized" className="w-80"/>
            <h1 className="font-header text-primary text-5xl">Oops! You’ve drifted off course</h1>
            <p className="font-text text-xs">"Looks like this page doesn’t exist or has moved.
                <span className='underline text-xs text-primary hover:cursor-pointer' onClick={()=>{navigate(-1)}}>Click here to step back</span>"
            </p>
        </div>



  )
}

