import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

const CourseAssignedAdminDetailsModal = ({ open, close, className, selectedAdmin }) => {
  if (!selectedAdmin) return null;

  const { first_name, middle_name, last_name, name_suffix, employeeID, profile_image, roles, branch, city, department, division, title } = selectedAdmin;

  const fullName = [first_name, middle_name, last_name, name_suffix].filter(Boolean).join(' ');

  return (
    <Dialog open={open} onClose={() => {}} className={className}>
      <DialogBackdrop
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0
          data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-40"
      />
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
            className="w-[50rem] transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all
              data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200
              data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="bg-white rounded-md h-fit flex flex-col">
              {/* Header with gradient */}
              <div className="bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-md">
                <div className="flex flex-col bg-gradient-to-b from-transparent to-black rounded-t-md gap-4">
                  <div className="p-4 flex flex-col gap-y-4">
                    <div className="flex items-center justify-end">
                      <div
                        className="border-2 border-white rounded-full text-white flex items-center justify-center
                          hover:bg-white hover:text-primary hover:cursor-pointer transition-all ease-in-out
                          w-5 h-5 text-xs md:w-8 md:h-8 md:text-base"
                        onClick={close}
                        aria-label="Close modal"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </div>
                    </div>
                    <div className="px-4">
                      <h2 className="font-header text-white text-base md:text-2xl">
                        Assigning to Course Admin
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Info Section */}
              <div className="px-8 pt-6 pb-4 flex flex-row flex-nowrap gap-6">
                <div className="bg-gray-200 h-20 w-20 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={profile_image}
                    alt={`${fullName}'s profile`}
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col justify-center gap-y-1">
                  <p className="font-text text-lg font-semibold">{fullName}</p>
                  <p className="font-text text-xs text-unactive">
                    Employee ID: {employeeID || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="px-8 pb-8 grid grid-cols-2 gap-10 text-sm">
                <div>
                  <p className="font-text text-xs text-unactive uppercase mb-1">Role</p>
                  <p className="font-text md:text-base text-xs">
                    {roles?.[0]?.role_name || 'No Role Assigned'}
                  </p>
                </div>
                <div>
                  <p className="font-text text-xs text-unactive uppercase mb-1">Title</p>
                  <p className="font-text md:text-base text-xs">{title?.title_name || 'No Title'}</p>
                </div>
                <div>
                  <p className="font-text text-xs text-unactive uppercase mb-1">Department</p>
                  <p className="font-text md:text-base text-xs">
                    {department?.department_name || 'No Department'}
                  </p>
                </div>
                <div>
                  <p className="font-text text-xs text-unactive uppercase mb-1">Division</p>
                  <p className="font-text md:text-base text-xs">
                    {division?.division_name || 'No Division'}
                  </p>
                </div>
                <div>
                  <p className="font-text text-xs text-unactive uppercase mb-1">Branch</p>
                  <p className="font-text md:text-base text-xs">{branch?.branch_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-text text-xs text-unactive uppercase mb-1">City</p>
                  <p className="font-text md:text-base text-xs">{city?.city_name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default CourseAssignedAdminDetailsModal;
