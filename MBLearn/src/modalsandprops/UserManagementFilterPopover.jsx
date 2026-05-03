import { faFilter, faSquarePen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from '@headlessui/react'


const filter = [
    {
        id:'name',
        name: 'Employee Name',
        option: [
            {value: '' , label: 'A to E', checked: false },
            {value: '' , label: 'F to J', checked: false },
            {value: '' , label: 'K to O', checked: false },
            {value: '' , label: 'P to T', checked: false },
            {value: '' , label: 'U to Z', checked: false },
        ]
    },
    {
        id:'department',
        name: 'Department',
        option: [
            {value: '' , label: 'Human Resources', checked: false },
            {value: '' , label: 'Information Technology Support', checked: false },
            {value: '' , label: 'Accountings', checked: false },
            {value: '' , label: 'Adminisitration', checked: false },

        ]
    },
    {
        id:'branch',
        name: 'Branch',
        option: [
            {value: '' , label: 'Novaliches', checked: false },
            {value: '' , label: 'Caloocan', checked: false },
            {value: '' , label: 'Marikina', checked: false },
            {value: '' , label: 'Metro Manila', checked: false },
            {value: '' , label: 'Bonifacio Global City', checked: false },
        ]
    },
    {
        id:'role',
        name: 'Role',
        option: [
            {value: '' , label: 'System Admin', checked: false },
            {value: '' , label: 'Course Admin', checked: false },
            {value: '' , label: 'Learner', checked: false },
        ]
    },
]

const UserManagemenFilterPopover = () => {
    return(
        <Popover className="relative">
            <PopoverButton className="flex flex-row items-center border-2 border-primary py-2 px-4 font-header bg-secondarybackground rounded-md text-primary gap-2 w-fit hover:bg-primary hover:text-white hover:cursor-pointer transition-all ease-in-out shadow-md">
                <p>Filter</p>
                <FontAwesomeIcon icon={faFilter}/>
            </PopoverButton>
            <PopoverPanel anchor="bottom start" transition className="w-fit bg-white border-2 border-primary rounded-md shadow-md [--anchor-gap:4px] origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0">
                <div className="p-5 grid grid-cols-[12.5rem_12.5rem_12.5rem_12.5rem] gap-10">
                    {
                        filter.map((section) => (
                            <div key={section.id} className="flex flex-col gap-2">
                                {/* Section Name */}
                                <div className='inline-flex py-2 border-b border-unactive text-unactive gap-2 items-center justify-between'>
                                    <h1 className='font-header uppercase text-xs'>{section.name}</h1>
                                    <FontAwesomeIcon icon={faSquarePen} className='hover:cursor-pointer hover:text-primary transition-all ease-in-out'/>
                                </div>
                                {/* Section content */}
                                <div className='flex flex-col gap-2 pt-2'>
                                    {
                                        section.option.map((option)=>(
                                            <div key={option.value} className='flex flex-row items-center gap-2 py-1'>
                                                <input type='checkbox' id={option.value} name={option.value} value={option.value} checked={option.checked}/>
                                                <label htmlFor={option.value} className='font-text hover:cursor-pointer hover:text-primary transition-all ease-in-out'>{option.label}</label>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        ))
                    }

                </div>
            </PopoverPanel>
        </Popover>
    )
}
export default UserManagemenFilterPopover;
