import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "../../hooks";

export default function CreateTables({children}){
    useEffect(()=>{
        createAllTables;
    })

  const fetch = useAuthenticatedFetch();


    async function createAllTables(){
        fetch(`api/table/createReviewTable`)
        .then((res)=>res.json())
        .then((data)=>console.log(data))
    
        
          fetch(`api/table/createDetailTable`)
          .then((res)=>res.json())
          .then((data)=>console.log(data))
        
    
        
          fetch(`api/table/createDeletedReviewsTable`)
          .then((res)=>res.json())
          .then((data)=>console.log(data))
        
    
      }

      return(
        <>
            {children}
        </>
      )
}