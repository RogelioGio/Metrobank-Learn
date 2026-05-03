import { Helmet } from "react-helmet"


export default function MyEmployee() {
    return (
        <div className='grid  grid-cols-4 grid-rows-[6.25rem_min-content_auto_auto_min-content] h-full w-full'>
            <Helmet>
                {/* Title of the mark-up */}
                <title>MBLearn | My Emloyees</title>
            </Helmet>

            {/* Header */}
            <div className='flex flex-col justify-center col-span-3 row-span-1 pr-5 border-b ml-5 border-divider'>
                <h1 className='text-primary text-4xl font-header'>My Employees</h1>
                <p className='font-text text-sm text-unactive' >List of employee under your department</p>
            </div>

        </div>
    )
}

