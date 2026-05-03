import Error401 from "../assets/401_Error_Unauthorized-rafiki.svg";
const Unauthorized = () => {
    return (
        <div className="bg-background w-screen h-screen flex items-center justify-center flex-col gap-3">
            <img src={Error401} alt="Unauthorized" className="w-80"/>
            <h1 className="font-header text-primary text-5xl">Unauthorized Action</h1>
            <p className="font-text text-xs">"Oops! 🚫 You don’t have permission to access this action—nice try, but no shortcuts here! 😉"</p>
        </div>
    );
};
export default Unauthorized;
