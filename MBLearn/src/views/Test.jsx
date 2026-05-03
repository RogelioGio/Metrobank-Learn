import { useEffect } from "react";
import axiosClient from "../axios-client";
// import echo from "MBLearn/echo";

import { use } from "react";


export default function Test(){
    useEffect(() => {
        const channel = echo.private('channel-name').listen('.Test', (e)=>{
            alert("Hello")
            console.log(e);
            console.log('can hear channel')
        });

        return () => {
            echo.leave('channel-name')
        }
    }, [])

    const handleClick = () => {
        axiosClient.post('test')
        .then((e) => {
            console.log(e);
        }).catch((err) => {
            console.log('error')
        })
    };


  return (
    <>
    <button onClick={handleClick}>
        Call /Test
    </button>
    </>
  );
};
