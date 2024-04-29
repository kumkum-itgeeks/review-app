import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "../../hooks";
import { createContext } from "react";
export const MyContext = createContext();
export default function MyPlanProvider({children}){

    const [hasPlan , setHasPlan] = useState({
        planExists: false ,
        activePlan : null
    });
    const fetch = useAuthenticatedFetch();

    useEffect(()=>{
        fetch(`/api/table/checkPlanTableExists`)
        .then((res)=>res.json())
        .then((data)=>{
            const {planExists}=data;
            setHasPlan(data)})
        .catch((err)=>{
            console.error('error checking table ', err)
        })
    },[])
    return(
        <>
        <MyContext.Provider value={{hasPlan , setHasPlan}}>
        {children}
        </MyContext.Provider>
        </>
    )
}