const LearnerLoadingProps = () => {
    return(
        <>
        {
            Array(5).fill(0).map((item, index) => (
                <tr key={index}>
                    <td className={`font-header px-4 py-3 flex flex-row items-center gap-4 border-l-2 border-transparent animate-pulse w-full`}>

                    {/* Checkbox */}
                    <div className="group grid size-4 grid-cols-1">
                        <input type="checkbox"
                            className="min-w-4 col-start-1 row-start-1 appearance-none border border-divider rounded"
                            />
                    </div>

                    <div className="min-w-8 min-h-8 rounded-full bg-blue-500"></div>


                    <div className="flex flex-col gap-1 w-full">
                    <div className="h-4 w-full bg-gray-300 rounded-full"></div>
                    <div className="h-3 w-1/2 bg-gray-300 rounded-full"></div>
                    </div>
                    </td>

                    <td className="px-4 py-3 font-text text-unactive animate-pulse hidden md:table-cell">
                        <div className="flex flex-col gap-2">
                        <div className="h-4 w-36 bg-gray-300 rounded-full"></div>
                        <div className="h-3 w-20 bg-gray-300 rounded-full"></div>
                        </div>
                    </td>
                    <td className="px-4 py-3font-text text-unactive animate-pulse hidden md:table-cell">
                        <div className="flex flex-col gap-2">
                        <div className="h-4 w-36 bg-gray-300 rounded-full"></div>
                        <div className="h-3 w-20 bg-gray-300 rounded-full"></div>
                        </div>
                    </td>
                    <td className="px-4 py-3 font-text text-unactive animate-pulse hidden md:table-cell">
                        <div className="flex flex-col gap-2">
                        <div className="h-4 w-36 bg-gray-300 rounded-full"></div>
                        <div className="h-3 w-20 bg-gray-300 rounded-full"></div>
                        </div>
                    </td>
                </tr>
            ))
        }
        </>
    )
}
export default LearnerLoadingProps;
