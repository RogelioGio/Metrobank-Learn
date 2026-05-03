import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../axios-client";
import styles from "../assets/compeLearn/navbar/sidebar.module.css";
import { faBook, faChevronDown, faChevronUp, faFolderOpen, faGraduationCap, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useStateContext } from "../contexts/ContextProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const SideNavBar = () => {
    const {setToken} = useStateContext();
    const handleLogOut = () => {
        axiosClient.post('/logout')
            .then(() => {
                setToken(null);
                navigate('/login');
            })
            .catch((error) => {
                console.error(error);
            });
    }








    return(
        <div className={styles.container}>
            <div className={styles.components}>
                <div className={styles.logoWrapper}>
                    <img src='../../public/images/logo(white).png' alt='logo' className={styles.logo} />
                    CompE-Learn
                </div>
            </div>
            <div className="flex flex-row gap-3 items-center text-white font-header"
                onClick={() => {handleLogOut()}}>
                <FontAwesomeIcon icon={faRightFromBracket} className={styles.icon} />
                <p>Logout</p>
            </div>
        </div>
    )
}
export default SideNavBar
