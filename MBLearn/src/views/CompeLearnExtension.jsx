import bg from '../assets/rect2.png';
import logo from '../assets/CompleLearn Logo.svg';
const CompeLearnExtension = () => {
    return(
        <>
            <div
                style={{ backgroundImage: `url(${bg})` }}
                className="w-screen h-screen flex items-center justify-center flex-col gap-3 bg-no-repeat bg-cover"
            >

                <div className='flex flex-row items-center justify-center gap-10'>
                    <div className='w-32'>
                        <img src={logo} alt=""/>
                    </div>
                    <div>
                        <p className="font-text text-white text-7xl"><span className="font-header">Comp-E-Learn</span> Extension</p>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center'>
                    <p className="font-text text-white">Connecting Soon...</p>
                </div>

            </div>
        </>
    )
}
export default CompeLearnExtension
