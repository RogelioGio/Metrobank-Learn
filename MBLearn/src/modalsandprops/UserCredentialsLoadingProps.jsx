const UserCredentialsLoadingProps = () => {
    return(
        <>
            {
                Array(5).fill().map((item, index) => (
                    <tr key={index}>
                        <td className="animate-pulse py-3 px-4">
                            <div className='flex items-center gap-2'>
                                {/* User Image */}
                                <div className='bg-blue-500 h-10 w-10 rounded-full'>
                                    <img alt="" className='rounded-full'/>
                                </div>
                                {/* Name */}
                                <div className="flex flex-col gap-2">
                                <div className="bg-gray-300 h-4 w-36 rounded-full"></div>
                                <div className="bg-gray-300 h-4 w-20 rounded-full"></div>
                                </div>
                            </div>
                        </td>
                        <td className="py-3 px-4 animate-pulse hidden lg:table-cell">
                            <div className="bg-gray-300 h-4 w-36 rounded-full"></div>
                        </td>
                        <td className="py-3 px-4 animate-pulse hidden lg:table-cell">
                            <div className="bg-gray-300 h-4 w-36 rounded-full"></div>
                        </td>
                        <td className="py-3 px-4 animate-pulse hidden lg:table-cell">
                            <div className="bg-gray-300 h-4 w-36 rounded-full"></div>
                        </td>
                        <td className="py-3 px-4 animate-pulse hidden lg:table-cell ">
                            <div className="flex items-center justify-end gap-2">
                                <div className="bg-gray-300 h-10 w-10 rounded-md"></div>
                                <div className="bg-gray-300 h-10 w-10 rounded-md"></div>
                            </div>
                        </td>
                    </tr>
                ))
            }
        </>
    )
}
export default UserCredentialsLoadingProps;
