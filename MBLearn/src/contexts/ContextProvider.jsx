import { set } from "date-fns";
import { createContext, useContext, useState } from "react";

const StateContext = createContext({
    user: null,
    token: null,
    refreshToken: null,
    role: null,
    availableRoles: [],
    EmployeeID: null,
    profile_image: null,
    authenticated: false,
    events: [],
    activities: [],
    pageTitle: '',
    showBack: false,
    shouldConfirmBack: false,
    unread: false,
    setUser: () => {},
    setToken: () => {},
    setRefreshToken: () => {},
    setRole: () => {},
    setAvailableRoles: () => {},
    setEmployeeID: () => {},
    setProfile: () => {},
    SetAuthenticated: () => {},
    setEvents: () => [],
    setActivities: () => [],
    setPageTitle: () => {},
    setShowBack: () => {},
    setShouldConfirmBack: () => {},
    setUnread: () => {}
});

//passing information into layouts
export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [refreshToken, _setRefreshToken] = useState(localStorage.getItem("REFRESH_TOKEN"));
    const [role, _setRole] = useState(localStorage.getItem('LOGIN_AS'));
    const [availableRoles, setAvailableRoles] = useState([]);
    const [employeeID, setEmployeeID] = useState('');
    const [profile_image, setProfile] = useState('');
    const [authenticated, _setAuthenticated] = useState(false);
    const [events, _setEvents] = useState([]);
    const [activities, _setActivities] = useState([])
    const [pageTitle, _setPageTitle] = useState('');
    const [showBack, _setShowBack] = useState(false);
    const [shouldConfirmBack, _setShouldConfirmBack] = useState(false);
    const [provider, setProvider] = useState(null);
    const [unread, _setUnread] = useState(false);

    const setToken = (token) => {

        _setToken(token);
        try{
            if (token) {
                localStorage.setItem('ACCESS_TOKEN', token)
            } else{
                localStorage.removeItem('ACCESS_TOKEN')
            }
        }catch(e){
            console.error(e);
        }
    };
    const setRefreshToken = (refreshToken) => {   // ✅
    _setRefreshToken(refreshToken);
    try {
        if (refreshToken) {
            localStorage.setItem("REFRESH_TOKEN", refreshToken);
        } else {
            localStorage.removeItem("REFRESH_TOKEN");
        }
        } catch (e) {
        console.error(e);
        }
    };

    const setUnread = (val) => {
        _setUnread(val);
    }

    const setRole = (role) => {
        _setRole(role);
        try{
            if(role){
                localStorage.setItem('LOGIN_AS', role)
            } else{
                localStorage.remove('LOGIN_AS')
            }
        }catch(e){
            console.log(e)
        }
    }

    const setEvents = (events) => {
        _setEvents(events);
    }


    const SetAuthenticated = (authenticated) => {
        _setAuthenticated(authenticated);
    }

    const setActivities = (activities) => {
        _setActivities(activities);
    }

    const setPageTitle = (title) => {
        _setPageTitle(title);
    }

    const setShowBack = (show) => {
        _setShowBack(show);
    }

    const setShouldConfirmBack = (val) => {
        _setShouldConfirmBack(val);
    };

    return(
        //passing information into the layouts and components
        <StateContext.Provider value={{
            user,
            token,
            role,
            availableRoles,
            employeeID,
            profile_image,
            authenticated,
            events,
            activities,
            pageTitle,
            showBack,
            shouldConfirmBack,
            refreshToken,
            unread,
            provider,
            setUser,
            setToken,
            setRole,
            setAvailableRoles,
            setEmployeeID,
            setProfile,
            SetAuthenticated,
            setEvents,
            setActivities,
            setPageTitle,
            setShowBack,
            setShouldConfirmBack,
            setRefreshToken,
            setProvider,
            setUnread
            }}>

            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);
