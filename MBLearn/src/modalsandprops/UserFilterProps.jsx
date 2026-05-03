import FontAwesome from "react-fontawesome";
import { useOption } from "../contexts/AddUserOptionProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const UserFilterProps = ({formik, used_to , close}) => {
    const {divisions, career_level} = useOption();

    return (
        <>
        <form onSubmit={formik ? formik.handleSubmit : ""} className='flex-col flex gap-2'>
            <div className="inline-flex flex-col gap-1">
                <label htmlFor="division" className="font-header text-xs flex flex-row justify-between">
                    <p className="text-xs font-text text-unactive">Division </p>
                </label>
                <div className="grid grid-cols-1">
                    <select id="division" name="division" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                        value={formik.values.division}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        >
                        <option value=''>Select Division</option>
                        {
                            divisions?.map((division) => (
                                <option key={division.id} value={division.id}>{division.division_name}</option>
                            ))
                        }
                    </select>
                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
            <div className="inline-flex flex-col gap-1">
                <label htmlFor="department" className="font-header text-xs flex flex-row justify-between">
                    <p className="text-xs font-text text-unactive">Department </p>
                </label>
                <div className="grid grid-cols-1">
                    <select id="department" name="department" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                        value={formik.values.department}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={formik.values.division === '' || divisions.length === 0}
                        >
                        <option value=''>Select Department</option>
                        {
                            divisions.find((d) => d.id === Number(formik.values.division))?.departments.map((department) => (
                                <option key={department.id} value={department.id}>{department.department_name}</option>
                            ))
                        }
                    </select>
                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
            <div className="inline-flex flex-col gap-1">
                <label htmlFor="careerLevel" className="font-header text-xs flex flex-row justify-between">
                    <p className="text-xs font-text text-unactive">Career Level</p>
                </label>
                <div className="grid grid-cols-1">
                    <select id="careerLevel" name="careerLevel" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                        value={formik.values.careerLevel}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={formik.values.division === '' || career_level.length === 0}
                        >
                        <option value=''>Select Career Level</option>
                        {
                            career_level.map((section) => (
                                <option key={section.id} value={section.id}>{section.name}</option>
                            ))
                        }
                    </select>
                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
            <div className="inline-flex flex-col gap-1">
                <label htmlFor="title" className="font-header text-xs flex flex-row justify-between">
                    <p className="text-xs font-text text-unactive">Title</p>
                </label>
                <div className="grid grid-cols-1">
                    <select id="title" name="title" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={formik.values.division === '' || formik.values.careerLevel === ''}
                        >
                        <option value=''>Select Section</option>
                        {
                            divisions.find(dept => dept.id === Number(formik.values.division))?.departments.find(div => div.id === Number(formik.values.department))?.titles.filter(t => t.career_level_id === Number(formik.values.careerLevel)).map((section) => (
                                <option key={section.id} value={section.id}>{section.title_name}</option>
                            ))
                        }
                    </select>
                    <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
        </form>
        <div className='flex-row flex justify-between w-full py-1 gap-2 items-end mt-4'>
            <div className="w-full bg-primary rounded-md shadow-md hover:cursor-pointer hover:bg-primaryhover ease-in-out transition-all p-4 flex flex-row justify-center gap-2 items-center"
                onClick={() => {
                        if (used_to === "report") {
                        console.log("Generating Report with Filters: ", formik.values);
                        close();
                        }
                    }}>
                <FontAwesomeIcon icon={faFilter} className='text-white text-base mr-1'/>
                <span className='text-white font-header text-base'>Apply Filters</span>
            </div>
        </div>
        </>

    )
}

export default UserFilterProps;

                    // <div>
                    //     <h1 className='font-header text-2xl text-primary'>User Filter</h1>
                    //     <p className='text-md font-text text-unactive text-sm'>Categorize user with the given parameters</p>
                    // </div>

                    // <form onSubmit={filterformik.handleSubmit} className='flex-col flex gap-3'>
                        // <div className="inline-flex flex-col gap-1">
                        // <label htmlFor="division" className="font-header text-xs flex flex-row justify-between">
                        //     <p className="text-xs font-text text-unactive">Division </p>
                        // </label>
                        // <div className="grid grid-cols-1">
                        //     <select id="division" name="division" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                        //         value={filterformik.values.division}
                        //         onChange={filterformik.handleChange}
                        //         onBlur={filterformik.handleBlur}
                        //         >
                        //         <option value=''>Select Division</option>
                        //         {
                        //             division.map((division) => (
                        //                 <option key={division.id} value={division.id}>{division.division_name}</option>
                        //             ))
                        //         }
                        //     </select>
                        //     <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                        //     <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        //     </svg>
                        // </div>
                        // </div>
                        // <div className="inline-flex flex-col gap-1">
                        // <label htmlFor="department" className="font-header text-xs flex flex-row justify-between">
                        //     <p className="text-xs font-text text-unactive">Department </p>
                        // </label>
                        // <div className="grid grid-cols-1">
                        //     <select id="department" name="department" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                        //         value={filterformik.values.department}
                        //         onChange={filterformik.handleChange}
                        //         onBlur={filterformik.handleBlur}
                        //         >
                        //         <option value=''>Select Department</option>
                        //         {
                        //             departments.map((department) => (
                        //                 <option key={department.id} value={department.id}>{department.department_name}</option>
                        //             ))
                        //         }
                        //     </select>
                        //     <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                        //     <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        //     </svg>
                        // </div>
                        // </div>
                        // <div className="inline-flex flex-col gap-1">
                        // <label htmlFor="section" className="font-header text-xs flex flex-row justify-between">
                        //     <p className="text-xs font-text text-unactive">Section</p>
                        // </label>
                        // <div className="grid grid-cols-1">
                        //     <select id="section" name="section" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                        //         value={filterformik.values.section}
                        //         onChange={filterformik.handleChange}
                        //         onBlur={filterformik.handleBlur}
                        //         >
                        //         <option value=''>Select Section</option>
                        //         {
                        //             section.map((section) => (
                        //                 <option key={section.id} value={section.id}>{section.section_name}</option>
                        //             ))
                        //         }
                        //     </select>
                        //     <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                        //     <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        //     </svg>
                        // </div>
                        // </div>
                    //     <div className="inline-flex flex-col gap-1">
                    //     <label htmlFor="city" className="font-header text-xs flex flex-row justify-between">
                    //         <p className="text-xs font-text text-unactive">City</p>
                    //     </label>
                    //     <div className="grid grid-cols-1">
                    //         <select id="city" name="city" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                    //             value={filterformik.values.city}
                    //             onChange={handleBranchesOptions}
                    //             onBlur={filterformik.handleBlur}
                    //             >
                    //             <option value=''>Select Branch City</option>
                    //             {
                    //                 cities.map((city) => (
                    //                     <option key={city.id} value={city.id}>{city.city_name}</option>
                    //                 ))
                    //             }
                    //         </select>
                    //         <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                    //         <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    //         </svg>
                    //     </div>
                    //     </div>
                    //     <div className="inline-flex flex-col gap-1">
                    //     <label htmlFor="branch" className="font-header text-xs flex flex-row justify-between">
                    //         <p className="text-xs font-text text-unactive">Location</p>
                    //     </label>
                    //     <div className="grid grid-cols-1">
                    //         <select id="branch" name="branch" className="appearance-none font-text col-start-1 row-start-1 border border-divider rounded-md p-2 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                    //             value={filterformik.values.branch}
                    //             onChange={filterformik.handleChange}
                    //             onBlur={filterformik.handleBlur}
                    //             >
                    //             <option value=''>Select Branch Location</option>
                    //             {selectedBranches.map((branch) => (
                    //                 <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                    //             ))}
                    //         </select>
                    //         <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                    //         <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    //         </svg>
                    //     </div>
                    //     </div>
                    //     <div className='flex-row flex justify-between w-full py-1 gap-2 items-end'>
                    //     <button type='submit' className={`w-full`}>
                    //         <div className='px-3 py-2 flex flex-row justify-center gap-2 items-center bg-primary rounded-md shadow-md hover:cursor-pointer hover:scale-105 ease-in-out transition-all '>
                    //             <p className='text-white font-header'>Filter</p>
                    //             <FontAwesomeIcon icon={faFilter} className='text-white text-sm'/>
                    //         </div>
                    //     </button>
                    //     {
                    //         isFiltered ? (
                    //         <button type='button' onClick={resetFilter}>
                    //             <div className='aspect-square px-3 flex flex-row justify-center items-center border-2 border-primary rounded-md shadow-md hover:cursor-pointer hover:scale-105 ease-in-out transition-all '>
                    //                 <FontAwesomeIcon icon={faXmark} className='text-primary text-sm'/>
                    //             </div>
                    //         </button>):(
                    //             null
                    //         )
                    //     }
                    //     </div>
                    // </form>
