import { faChevronDown, faChevronUp, faMinus, faPenToSquare, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import React, { useEffect, useState } from "react";

const CourseFilterProps = ({isEdit}) => {
    // Sample Course Filter Array
    const [filter, setfilter] = useState([
        {
            id:'coursetype',
            name: 'Course Type',
            option: [
                {value: 'softskill' , label: 'Soft Skill Training', checked: false },
                {value: 'technical' , label: 'Technical Training', checked: false },
                {value: 'leadership' , label: 'Compliance Training', checked: false },
            ]
        },
        {
            id:'coursecategory',
            name: 'Course Category',
            option: [
                {value: 'professionaldev' , label: 'Professional Development', checked: false },
                {value: 'dataandanalytics' , label: 'Data and Analystics', checked: false },
                {value: 'managementandleadership' , label: 'Management and Leadership', checked: false },
            ]
        },
    ])

    // FilterStates
    const [filterState, setFilterstate] = useState({
        openFilterEditor: isEdit,
        insertNewCategory: false,
    })
    useEffect(() => {
        setFilterstate((prevState) => ({
            ...prevState,
            openFilterEditor: isEdit,
        }));
        if (!isEdit) {
            saveNewOptions();
        }
    }, [isEdit]);

    // Checkbox Change state functions
    const [isfilter, isSetfilter] = useState({});
    const handleFilter = (sectionId, value) => {
        isSetfilter((prev) => ({
            ...prev,
            [sectionId]: prev[sectionId] === value ? undefined : value
        }));
    }


    // Add Filter Option
    const [newFilterOption, setNewFilterOption] = useState({}) //Unsaved Filter Option
    const insertOption = (e,categoryID, Index = null) =>{
        e.preventDefault();

        // Add filter option in unsaved filter option
        if(Index !== null){
            setNewFilterCategory((prev) => {
                const updatedCategories = [...prev];
                updatedCategories[Index].option.push("");
                return updatedCategories;
            })
        }else{
            // Add filter option in saved filter option
            setNewFilterOption((prev) => ({
                ...prev,
                [categoryID]:[...(prev[categoryID] || []), ''],
            }))
        }
    }
    const handleNewOption = (categoryID, index, value, Index=null) => {
        // Add filter option in unsaved filter option
        if(Index !== null){
            setNewFilterCategory((prev) => {
                const updatedCategories = [...prev];
                updatedCategories[Index].option[index] = value;
                return updatedCategories;
            });
        } else {
            // Add filter option in saved filter option
            setNewFilterOption((prev) => {
                const updatedOption = [...(prev[categoryID]||[])];
                updatedOption[index] = value;
                return{...prev, [categoryID]: updatedOption};
            });
        }
    }

    // Add Filter Category
    const [newFilterCategory, setNewFilterCategory] = useState([]); //Unsaved Filter Category
    const insertCategory = (e) =>{
        e.preventDefault();
        setNewFilterCategory((prev) => [...prev, {id:'', name:'',option:[]}])
    }
    const handleFilterCategory = (index, value) => {
        setNewFilterCategory((prev) => {
            const updatedCategories = [...prev];
            updatedCategories[index] = {
                ...updatedCategories[index],
                id: value.toLowerCase().replace(/\s+/g, ""),
                name: value,
                option:[]
            };
            return updatedCategories;
        })
    }

    // Edit Filter Option
    const [editingFilterOption, setEditingFilterOption] = useState(null); //Edit the saved filter option
    const [tempEditedValue, setTempEditedValue] = useState(''); // filter option placeholder
        //Handle input change
        const handleInputChange = (e) => {
            setTempEditedValue(e.target.value);
        };
        const editFilterOption = (categoryID, optionValue, isNew=false, optionLabel) => {
            setEditingFilterOption({categoryID, optionValue, isNew});
            setTempEditedValue(optionLabel);
        }
        // Save function to be called in the final global save function
        const handleSave = (categoryID, oldValue, isNew) => {
            saveEditedFilterOption(categoryID, oldValue, tempEditedValue, isNew);
        };
        // Save Edited Filter Option
        const saveEditedFilterOption = (categoryID, oldValue, newValue, isNew) => {
            //Edit function for the unsave category
            if(isNew){
                setNewFilterOption((prev) => {
                    const updatedOption = prev[categoryID].map((opt) => (opt === oldValue ? newValue : opt));
                    return{...prev, [categoryID]: updatedOption};
                });
            } else {
                //Edit function for the saved category
                setfilter((prevFilters) =>
                        prevFilters.map((category) =>
                            categoryID === category.id ? {
                                ...category,
                                option: category.option.map((option) => option.value === oldValue ? {...option, value:newValue.toLowerCase(), label: newValue} : option),
                            } : category
                        )

                )
            }
            //Reset the editing state
            setEditingFilterOption(null);
        }

    // Edit Filter Category
    const [editingCategoryIndex, setEditingCategoryIndex] = useState(null); //Edit Filter Category State
    const editCourseCategory = (save,categoryID, newName) => {
        if(save === "saved"){
            setfilter((prevFilters) =>
                prevFilters.map((category) =>
                    category.id === categoryID ? {...category, name: newName}:category
                )
            )
        }else{
            setNewFilterCategory((prev) => {
                const updatedCategories = [...prev];
                updatedCategories[index] = {
                    ...updatedCategories[index],
                    name: newName,
                };
                return updatedCategories;
            })
        }
    }

    // Delete Filter Option
    const deleteFilterOption = (categoryID, optionValue, isNew = false) => {
        //Delete the unsave filter option
        if(isNew){
            setNewFilterOption((prev => {
                const updatedOption = [...(prev[categoryID]||[])].filter((opt) => opt !== optionValue);
                return updatedOption.length > 0 ? { ...prev, [categoryID]: updatedOption}:{};
            }))
        } else {
            //Delete the saved filter option
            setfilter((prevFilters) =>
            prevFilters.map((category) =>
                category.id === categoryID ?
                {
                    ...category,
                    option: category.option.filter((option) => option.value !== optionValue),
                }:category)
            );
        }
    }

    // Delete Filter Category
    const deleteCourseCategory = (categoryID, isNewCategory = false) => {
        //Delete the unsaved filter category
        if(isNewCategory){
            setNewFilterCategory((prevCategories) =>
                prevCategories.filter((category, index) => index !== categoryID)
            );
        }else{
            // Delete the saved filter
            setfilter((prevFilters) =>
                prevFilters.filter((category) => category.id !== categoryID)
            )
        }
    }

    // Save Changes
    const saveNewOptions = ()=> {
        setNewFilterOption((prev) =>{

            const updatedOptions = Object.fromEntries(
                Object.entries(prev).map(([categoryID, options]) => [
                    categoryID,
                    options.filter((option) => option.trim() !== "")
                ])
            );
            return updatedOptions
        })

        setfilter((prevFilters) =>
                prevFilters.map((category) =>
                    newFilterOption[category.id]?.length > 0
                    ?{
                        ...category,
                        option: [
                            ...category.option,
                            ...newFilterOption[category.id]
                            .filter((option) => option.trim() !== "")
                            .map((value) => ({
                                value: value.toLowerCase().replace(/\s+/g, ""),
                                label: value,
                                checked: false,
                            })),
                        ]
                    }: category
                ))

        const unsavedCategoriesAndOption = newFilterCategory
        .filter((category) => category.name.trim() !== "")
        .map((category) =>
            ({
                ...category,
                option: (category.option||[])
                .filter((option) => option.trim() !== "") // Remove empty options
                .map((value) => ({
                    value: value.toLowerCase().replace(/\s+/g, ""),
                    label: value,
                    checked: false,
                })),
            })
        )

                setNewFilterOption({});
                setfilter((prev) => [...prev, ...unsavedCategoriesAndOption]);
                setNewFilterCategory([]);

                // Close editor mode
                setFilterstate('openFilterEditor', false);
    }

    return(
        <div className="flex flex-col h-full">
            <div className="pl-5 pr-2 mr-1 overflow-y-auto scrollbar-thin scrollbar-gutter scrollbar-thumb-primary scrollbar-track-primarybg scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-no-arrow">
                <form>
                    {
                        filter.map((category) =>(
                            <>
                                <Disclosure key={category.id} as="div" className='border-b border-divider py-6'>
                                    <h3 className="-my-3 flow-root font-text text-primary">
                                        <DisclosureButton className='group flex w-full justify-between py-3 text-sm hover:text-primary transition-all ease-in-out'>
                                            {
                                                filterState.openFilterEditor ? (
                                                    <div className='flex flex-row gap-4 items-center'>
                                                        <FontAwesomeIcon icon={faPenToSquare} className='text-unactive hover:cursor-pointer hover:text-primary transition-all ease-in-out' onClick={() => setEditingCategoryIndex(category.id)}/>
                                                        {
                                                            // Calls Edit Function
                                                            editingCategoryIndex === category.id ? (
                                                                <input
                                                                type="text"
                                                                className="border border-unactive rounded-md p-2 text-xs focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                                value={category.name}
                                                                onChange={(e) => editCourseCategory("saved", category.id, e.target.value)}
                                                                onBlur={() => setEditingCategoryIndex(null)}
                                                                autoFocus
                                                                />
                                                            ):(
                                                                <span>{category.name}</span>
                                                            )
                                                        }
                                                        <FontAwesomeIcon icon={faTrashCan} className='text-unactive cursor-pointer hover:text-primary transition-all ease-in-out' onClick={()=>deleteCourseCategory(category.id, false)}/>
                                                    </div>
                                                ):(
                                                    <span> {category.name}</span>
                                                )
                                            }
                                            <span className='ml-6 flex items-center'>
                                                <FontAwesomeIcon icon={faChevronDown} className='group-data-[open]:hidden'/>
                                                <FontAwesomeIcon icon={faChevronUp} className='group-[&:not([data-open])]:hidden'/>
                                            </span>
                                        </DisclosureButton>
                                    </h3>
                                    <DisclosurePanel className='pt-6'>
                                        <div className="space-y-4">
                                            {
                                                category.option.map((option, optionIdx) =>(
                                                    <div className='flex flex-row justify-between'>
                                                        <div key={option.value} className="flex gap-4">
                                                            {/* Checkbox Styling */}
                                                            <div className='flex h-5 shrink-0 items-center'>
                                                            {
                                                                filterState.openFilterEditor ? (
                                                                    editingFilterOption?.categoryID === category.id && editingFilterOption?.optionValue === option.value
                                                                    ?
                                                                    <input type="text"
                                                                    className='border border-unactive rounded-md p-2 text-xs focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary'
                                                                    value={tempEditedValue}
                                                                    onChange={handleInputChange}
                                                                    onBlur={() => handleSave(category.id, option.value, false)}
                                                                    onKeyDown={(e) => e.key === "Enter" && handleSave(category.id, option.value, false)}
                                                                    />
                                                                    :
                                                                    <FontAwesomeIcon icon={faPenToSquare} className='text-unactive hover:cursor-pointer hover:text-primary transition-all ease-in-out' onClick={() => editFilterOption(category.id, option.value, false, option.label)}/>

                                                                ):(
                                                                    <div className='group grid size-4 grid-cols-1'>
                                                                        <input defaultValue={option.value} defaultChecked={option.checked}
                                                                        id={`filter-${category.id}-${optionIdx}`} name={`${category.id}[]`} type="checkbox"
                                                                        className='col-start-1 row-start-1 appearance-none rounded border border-divider bg-white checked:border-primary checked:bg-primary hover:cursor-pointer'
                                                                        checked={isfilter[category.id] === option.value && !filterState.openFilterEditor} // Controlled state
                                                                        onChange={() => handleFilter(category.id, option.value)}
                                                                        disabled={filterState.openFilterEditor}/>

                                                                        <svg fill="none" viewBox="0 0 14 14" className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25">
                                                                        <path
                                                                            d="M3 8L6 11L11 3.5"
                                                                            strokeWidth={2}
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            className="opacity-0 group-has-[:checked]:opacity-100"
                                                                        />
                                                                        <path
                                                                            d="M3 7H11"
                                                                            strokeWidth={2}
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                                                        />
                                                                        </svg>
                                                                    </div>
                                                                )
                                                            }
                                                            </div>
                                                        {
                                                            editingFilterOption?.categoryID === category.id && editingFilterOption?.optionValue === option.value
                                                            ? null :
                                                            <label htmlFor={`filter-${category.id}-${optionIdx}`} className='text-sm font-text text-black hover:cursor-pointer'>{option.label}</label>
                                                        }
                                                        </div>
                                                        {/* Delete */}
                                                        {
                                                            filterState.openFilterEditor &&
                                                                <FontAwesomeIcon icon={faMinus} className='text-unactive cursor-pointer hover:text-primary transition-all ease-in-out' onClick={()=>deleteFilterOption(category.id,option.value)}/>
                                                        }
                                                    </div>
                                                    ))
                                            }
                                            {/* Add Filter Option Input*/}
                                            {
                                                newFilterOption[category.id]?.map((option, index) => (
                                                    <div key={`new-${category.id}-${index}`} className='flex flex-row justify-between items-center'>
                                                        <div className='flex gap-4 items-center'>
                                                            <div className='flex h-5 shrink-0 items-center'>
                                                                <FontAwesomeIcon icon={faPenToSquare} className='text-unactive hover:cursor-pointer hover:text-primary transition-all ease-in-out'/>
                                                            </div>
                                                            <input type="text"
                                                                    className='border border-unactive rounded-md p-2 text-xs focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary'
                                                                    value={option}
                                                                    onChange={(e) => handleNewOption(category.id, index, e.target.value)}/>
                                                        </div>
                                                        <FontAwesomeIcon icon={faMinus} className='text-unactive cursor-pointer hover:text-primary transition-all ease-in-out' onClick={() => deleteFilterOption(category.id, option, true)}/>
                                                    </div>
                                                ))
                                            }
                                            {/* Add FIlter Option Button*/}
                                            {
                                                filterState.openFilterEditor &&
                                                <button onClick={(e) => insertOption(e,category.id)} className='flex items-center gap-4 text-primary transition-all ease-in-out text-sm border border-primary py-2 px-4 rounded-full hover:bg-primary hover:text-white'>
                                                    <FontAwesomeIcon icon={faPlus}/>
                                                    <p className='font-text'>Add New Filter Item</p>
                                                </button>
                                            }
                                        </div>
                                    </DisclosurePanel>
                                </Disclosure>
                            </>
                        ))}
                        {/* Handle New Category */}
                        {
                            newFilterCategory.map((category, index) => (
                                <Disclosure key={`new-${index}`} as="div" className='border-b border-divider py-6'>
                                    <h3 className='-my-3 flow-root font-text text-primary'>
                                    <DisclosureButton className='group flex w-full justify-between py-3 text-sm hover:text-primary transition-all ease-in-out'>
                                        <input
                                            type="text"
                                            className='border border-unactive rounded-md p-2 text-xs focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary'
                                            value={category.name}
                                            onChange={(e) => handleFilterCategory(index, e.target.value)}
                                        />

                                        <span className='ml-6 flex items-center'>
                                            <FontAwesomeIcon icon={faChevronDown} className='group-data-[open]:hidden'/>
                                            <FontAwesomeIcon icon={faChevronUp} className='group-[&:not([data-open])]:hidden'/>
                                        </span>
                                    </DisclosureButton>
                                </h3>
                                {/* Handle New Category Options*/}
                                <DisclosurePanel className='pt-6'>
                                    {
                                        category.option?.map((option, optionIndex) => (
                                            <div key={`new-${index}-${optionIndex}`} className="flex flex-row justify-between items-center py-3">
                                                <input
                                                    type="text"
                                                    className="border border-unactive rounded-md p-2 text-xs focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary"
                                                    value={option}
                                                    onChange={(e) => handleNewOption(null, optionIndex, e.target.value, index)}
                                                />

                                                <FontAwesomeIcon
                                                    icon={faMinus}
                                                    className="text-unactive cursor-pointer hover:text-primary transition-all ease-in-out"
                                                    onClick={() => {
                                                        const updatedCategories = [...newFilterCategory];
                                                        updatedCategories[index].option.splice(optionIndex, 1);
                                                        setNewFilterCategory(updatedCategories);
                                                    }}
                                                />
                                            </div>
                                        ))
                                    }
                                    {/* Add FIlter Option Button*/}
                                    {
                                        filterState.openFilterEditor &&
                                        <button
                                            onClick={(e) => insertOption(e, null, index)}
                                            className='flex items-center gap-4 text-primary transition-all ease-in-out text-sm border border-primary py-2 px-4 rounded-full hover:bg-primary hover:text-white'
                                        >
                                            <FontAwesomeIcon icon={faPlus}/>
                                            <p className='font-text'>Add New Filter Item</p>
                                        </button>
                                    }
                                </DisclosurePanel>
                                </Disclosure>
                            ))
                        }
                        {
                            filterState.openFilterEditor &&
                            <button onClick={insertCategory} className='flex items-center gap-4 text-primary transition-all ease-in-out text-sm border border-primary py-2 my-3 px-4 rounded-full hover:bg-primary hover:text-white'>
                            <FontAwesomeIcon icon={faPlus}/>
                            <p className='font-text'>Add New Filter Category</p>
                            </button>
                        }
                </form>
            </div>

        </div>

    )
}
export default CourseFilterProps;
