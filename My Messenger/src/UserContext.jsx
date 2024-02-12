import { createContext, useEffect, useState } from "react";
import axios from "axios";
export const UserContext = createContext({});

export function UserContextProvider({children}){
    const [username, setUsername] = useState(null);
    const [id, setID] = useState(null);
    useEffect(() => {
        axios.get('/profile').then(response => {
            setID(response.data.userID);
            setUsername(response.data.username);
        })
    })

    return(
        <UserContext.Provider value={{username, setUsername, id, setID}}>
            {children}
        </UserContext.Provider>
    );
}