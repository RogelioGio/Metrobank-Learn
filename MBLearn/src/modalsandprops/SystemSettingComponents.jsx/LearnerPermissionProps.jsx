import { Switch } from "MBLearn/src/components/ui/switch"

const LearnerPermissionProps = ({isChecked,permissionswitch,permissionRef}) => {
    return(
        <>
            {/* Learners Permission */}
        <div>
            <p className="font-text text-unactive text-sm py-2">Learning Permission</p>
            <div className="flex flex-col gap-2 border border-primary rounded-md p-5 bg-white shadow-md">
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="UploadCertificate">
                        <h1 className="font-header text-primary text-base">Upload Certificate</h1>
                        <p className="font-text text-unactive text-sm">Allows users to upload external certificates as part of their learning records.</p>
                    </label>
                    <Switch id="UploadCertificate" checked={isChecked("UploadCertificate")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "UploadCertificate").id,"UploadCertificate",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="DeleteCertificate">
                        <h1 className="font-header text-primary text-base">Delete Certificate</h1>
                        <p className="font-text text-unactive text-sm">Grants the ability to remove previously uploaded certificates from the system.</p>
                    </label>
                    <Switch id="DeleteCertificate" checked={isChecked("DeleteCertificate")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "DeleteCertificate").id,"DeleteCertificate",checked)}/>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                    <label htmlFor="SelfEnroll">
                        <h1 className="font-header text-primary text-base">Self Enroll</h1>
                        <p className="font-text text-unactive text-sm">Allows users to enroll in available courses on their own without admin approval.</p>
                    </label>
                    <Switch id="SelfEnroll" checked={isChecked("SelfEnroll")} onCheckedChange={(checked) => permissionswitch(permissionRef.find(p => p.permission_name === "SelfEnroll").id,"SelfEnroll",checked)}/>
                </div>
            </div>
        </div>
        </>
    )
}
export default LearnerPermissionProps
