import { Children, createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { faTruckFieldUn } from "@fortawesome/free-solid-svg-icons";
import { set } from "date-fns";

const SelectedUser = createContext({
    selectedUser: null,
    setSelectedUser: () => {},
})

export const SelectedUserProvider = ({children}) => {
    const [selectedUser, _setSelectedUser] = useState({})
    // const [userId, setUserId] = useState(null)
    // const [selectedUserCreds, setSelectedUserCreds] = useState(null)
    // const [isFetching, setIsFetching] = useState(false);

    // useEffect(() => {
    //         setIsFetching(true)
    //     if (userId !== undefined && userId !== null) { // Ensuring userId is valid
    //         axiosClient.get(`/select-user/${userId}`)
    //         .then(response => {
    //             setSelectedUser(response.data.data);
    //             setIsFetching(false)
    //             console.log("User fetched:", response.data.data);
    //         })
    //         .catch(err => console.error(err));
    //     }
    // }, [userId]);

    // const selectUser = (id) => {
    //     if (id === userId && selectedUser) {
    //         setIsFetching(false);
    //         return; // Prevent unnecessary state updates
    //     }
    //     setIsFetching(true);
    //     setUserId(id);
    // };

    // const resetUser = () => {
    //     if (selectedUser) {
    //         setSelectedUser(null);
    //     }
    // }

    const setSelectedUser = (user) => {
        _setSelectedUser(user);
    }

    return(
        <SelectedUser.Provider value={{selectedUser, setSelectedUser}}>
            {children}
        </SelectedUser.Provider>
    )
}
export const useUser = () => useContext(SelectedUser)
