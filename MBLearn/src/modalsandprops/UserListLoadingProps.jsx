const UserListLoadingProps = () => {
    return (
        <>
            {Array(10)
                .fill(0)
                    .map((_, index) => (
                <tr key={index} className='font-text text-sm hover:bg-gray-200 z-10'>
                    <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                            {/* User Image */}
                            <div className='bg-blue-500 h-10 w-10 rounded-full'>
                                <div className='animate-pulse bg-gray-300 h-10 w-10 rounded-full'></div>
                            </div>
                            {/* Name and employee-id*/}
                            <div className="flex flex-col gap-1">
                                <div className='animate-pulse bg-gray-300 h-4 w-20 rounded-md'></div>
                                <div className='animate-pulse bg-gray-300 h-3 w-10 rounded-md'></div>
                            </div>
                        </div>
                    </td>
                    <td className='py-3 px-4 hidden lg:table-cell'>
                        <div className='flex flex-col gap-1'>
                            {/* Department */}
                            <div className='animate-pulse bg-gray-300 h-4 w-20 rounded-md'></div>
                            {/* Title */}
                            <div className='animate-pulse bg-gray-300 h-3 w-10 rounded-md'></div>
                        </div>
                    </td>
                    <td className='py-3 px-4 hidden lg:table-cell'>
                        <div className='flex flex-col gap-1'>
                            {/* Department */}
                            <div className='animate-pulse bg-gray-300 h-4 w-20 rounded-md'></div>
                            {/* Title */}
                            <div className='animate-pulse bg-gray-300 h-3 w-10 rounded-md'></div>
                        </div>
                    </td>
                    <td className='py-3 px-4 hidden lg:table-cell'>
                        <div className='flex flex-col gap-1'>
                        {/* Branch Location */}
                        <div className='animate-pulse bg-gray-300 h-4 w-20 rounded-md'></div>
                        {/* City Location */}
                        <div className='animate-pulse bg-gray-300 h-3 w-10 rounded-md'></div>
                        </div>
                    </td>
                    <td className='py-3 px-4 hidden lg:table-cell'>
                        <div className='flex gap-1 justify-end'>
                        {/* <div className='animate-pulse bg-gray-300 h-6 w-6 rounded-md'></div> */}
                        <div className='animate-pulse bg-gray-300 h-10 min-h-10 w-10 min-w-10 rounded-md'></div>
                        <div className='animate-pulse bg-gray-300 h-10 min-h-10 w-10 min-w-10 rounded-md'></div>
                        </div>
                    </td>
                </tr>
            ))}
        </>
    )
}

export default UserListLoadingProps
