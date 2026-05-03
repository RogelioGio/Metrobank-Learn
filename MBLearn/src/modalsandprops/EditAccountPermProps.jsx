import { useEffect, useState } from "react";
import SystemAdminPermissionProps from "./SystemSettingComponents.jsx/SystemAdminPermssionProps";
import CourseAdmin from "../components/CourseAdmin";
import CourseAdminPermissionProps from "./SystemSettingComponents.jsx/CourseAdminPermissionProps";
import LearnerPermissionProps from "./SystemSettingComponents.jsx/LearnerPermissionProps";

const EditAccountPermProps = ({initialRole,selectedRole,referencePermission,currentPermission,setCurrentPermission,roleWithPermission}) => {
    //currentPermission is the current permission the user have
    //referencePermission is the all the available permissions
    //isCheck is just a function that is thrown to know if user have the permssio or nah
    //permission is all the permission in the given role, default permissions

    const [initialPerms, setInitialPerms] = useState(currentPermission);

    const permissions = (roleId) => {
        if(initialRole !== roleId) {
            const role = roleWithPermission.find(r => r.id === roleId);
            setCurrentPermission(role?.permissions?.map(p => ({id: p.id, permission_name: p.permission_name})));
        }if(initialRole === roleId) {
            setCurrentPermission(initialPerms);
        }


    }
    useEffect(()=>{
        permissions(selectedRole);
    },[selectedRole])

    const isChecked = (permName) => {
        return currentPermission?.some(p => p.permission_name === permName) ?? false
    }
    const permissionSwitch = (perm_id,perm_name,checked) => {
        const name = referencePermission.find(p => p.permission_name === perm_name).permission_name;
        const ids = referencePermission.find(p => p.id === perm_id).id;

        setCurrentPermission(prev =>{
            const exist = prev.some(p => p.permission_name === perm_name);

            if(!exist) {
                return [...prev, {id: ids, permission_name: name}];
            }else if(exist){
                return prev.filter(p => p.permission_name !== name);
            }
        })
    }

    return (
        <>
            {
                selectedRole === 1 ?
                <SystemAdminPermissionProps isChecked={isChecked} permissionswitch={permissionSwitch} permissionRef={referencePermission}/>
                : selectedRole === 2 ?
                <CourseAdminPermissionProps isChecked={isChecked} permissionswitch={permissionSwitch} permissionRef={referencePermission}/>
                : selectedRole === 3 ?
                <LearnerPermissionProps isChecked={isChecked} permissiongswitch={permissionSwitch} permissionRef={referencePermission}/>
                : selectedRole === 4?
                    (
                        <div className="font-text text-center text-gray-500 py-10">
                            SME Permission will be added soon
                        </div>
                    )
                :null
            }
        </>
    )
}
export default EditAccountPermProps;
