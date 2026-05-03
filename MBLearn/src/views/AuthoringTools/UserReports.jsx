import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faDownload, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { Dialog } from "@headlessui/react";
import axiosClient from "MBLearn/src/axios-client";
import ActivityDetailsModal from "MBLearn/src/modalsandprops/AuthoringTool/ActivityDetailsModal";

export default function UserReports() {
    const { setPageTitle, setShowBack, user } = useStateContext();

    // console.log("Check this", user);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState("");
    const [actionType, setActionType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedLog, setSelectedLog] = useState(null);
    const [downloading, setDownloading] = useState(false);

    const userRoles = user?.user_infos?.roles || [];
    const isSMECreator = userRoles.some(role => role.role_name === 'SME-Creator');
    const isSMEViewer = userRoles.some(role => role.role_name === 'SME-Approver');
    const isSMEDistributor = userRoles.some(role => role.role_name === 'SME-Distributor');


    // console.log("sample", reportData);

    /// --------------------
    /// Fetch User Reports Stuffs
    /// --------------------
    const fetchUserReports = useCallback (async ( page = 1, search = "", actionType = "", fromDate = "", toDate = "") => {
        try {
            setLoading(true);
            const params = { page, per_page: itemsPerPage };

            if (search) params.search = search;
            if (actionType) params.actionType = actionType;
            if (fromDate) params.fromDate = fromDate;
            if (toDate) params.toDate = toDate;

            const response = await axiosClient.get(`/fetchUserReports/${user.user_infos.id}`,
                { params }
            );

            setReportData(response.data.data);
            setFilteredData(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user reports:", error);
            setLoading(false);
        }
    },[user?.user_infos?.id]); 

    /// --------------------
    /// Pagination Stuffs
    /// --------------------
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 15;

    useEffect(() => {
        if (user?.id) {
            fetchUserReports(currentPage, search, actionType, fromDate, toDate);
            setPageTitle("USER REPORTS");
            setShowBack(true);
        }
    }, [user?.id, currentPage, search, actionType, fromDate, toDate]);

    /// --------------------
    /// Pagination Stuffs
    /// --------------------
    const getUserFullName = (user) => {
        const {
            first_name,
            middle_name,
            last_name,
        } = user.user_infos;

        const fName = first_name ?? "";
        const mName = middle_name ?? "";
        const lName = last_name ?? "";

        return `${fName} ${mName} ${lName}`.replace(/\s+/g, " ").trim();
    };


    useEffect(() => {
        setPageTitle("REPORTS");
        setShowBack(false);
    }, []);

    const applyFilters = () => {
        setCurrentPage(1);
        fetchUserReports(1, search, actionType, fromDate, toDate);
    };

    const clearFilters = () => {
        setSearch("");
        setActionType("");
        setFromDate("");
        setToDate("");
        setCurrentPage(1);
        fetchUserReports(1, "", "", "", "");
    };


    const getTotalByAction = (type) => {
        const lowerType = type.toLowerCase();
        return reportData.filter((log) => {
            const action = log.Action || log.action || "";
            return action.toLowerCase().includes(lowerType);
        }).length;
    };

    const downloadUserReports = async () => {
        setDownloading(true);
        try {
            const params = { search, actionType, fromDate, toDate };

            const response = await axiosClient.get(`/downloadUserReport/${user.user_infos.id}`, {
                params,
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const now = new Date();
            const phtDateString = now.toLocaleString('sv-SE', { timeZone: 'Asia/Manila' });
            const timestamp = phtDateString.replace(' ', '-').replace(/:/g, '-');

            const fullName = `${user.user_infos.first_name || ''} ${user.user_infos.middle_name || ''} ${user.user_infos.last_name || ''}`
                .trim()
                .replace(/\s+/g, '-');

            const filename = `UserReport-${fullName}_T${timestamp}.pdf`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloading(false);
        }
    };



return (
  <>
    <Helmet>
      <title>CompELearn | Reports</title>
    </Helmet>

    <div className="w-full h-[92vh] max-h-screen grid grid-cols-4 grid-rows-[64px_1fr] pb-4 pr-4 gap-2">
      <div className="col-span-4 row-span-1 flex items-center justify-between px-6 bg-white border border-divider rounded-md shadow-md">

        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faClockRotateLeft} className="text-primary text-xl" />
          <h2 className="font-header text-xl text-primary">Activity Reports</h2>
        </div>
        <p className="text-sm text-unactive font-text">{getUserFullName(user)}</p>
      </div>

      <div className="col-span-4 row-span-1 overflow-auto bg-white border border-divider rounded-md shadow-md p-4 flex flex-col">

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end mb-4">
            <div className="flex flex-col w-48">
                <label htmlFor="search" className="text-xs font-medium mb-1 text-primary">Search</label>
                <input className="px-4 py-2 border border-divider rounded-md text-sm"
                id="search"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {
                isSMECreator &&
                <div className="flex flex-col w-48">
                <label htmlFor="actionType" className="text-xs font-medium mb-1 text-primary"> Action Type </label>
                    <select  className="px-3 py-2 border border-divider rounded-md text-sm"
                        id="actionType"
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                    >
                        <option value="">All Actions</option>
                        <option value="created">Created Course</option>
                        <option value="updated">Updated Course</option>
                        <option value="added module to course">Added Module to Course</option>
                        <option value="deleted module in course">Deleted Module in Course</option>
                        <option value="restored module in course">Restored Module in Course</option>
                        <option value="invited sme creator collaboration">Invited SME Creator Collaboration</option>
                        <option value="revoked course invitation">Revoked Course Invitation</option>
                        <option value="archived course">Archived Course</option>
                        <option value="deleted course">Deleted Course</option>
                        <option value="deleted archived course">Deleted Archived Course</option>
                        <option value="course submitted for approval">Course Submitted for Approval</option>
                        <option value="reassigned course reviewers">Reassigned Course Reviewers</option>
                        <option value="course approval revoked">Course Approval Revoked</option>
                    </select>
                </div>
            }

            {
                isSMEViewer &&
                <div className="flex flex-col w-48">
                <label htmlFor="viewerFilter" className="text-xs font-medium mb-1 text-primary"> Viewer Filter </label>
                    <select className="px-3 py-2 border border-divider rounded-md text-sm"
                        id="viewerFilter"
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="course approved">Course Approved</option>
                        <option value="course rejected">Course Rejected</option>
                    </select>
                </div>
            }

            {
                isSMEDistributor &&
                <div className="flex flex-col w-48">
                <label htmlFor="viewerFilter" className="text-xs font-medium mb-1 text-primary"> Distributor Filter </label>
                    <select className="px-3 py-2 border border-divider rounded-md text-sm"
                        id="viewerFilter"
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="course approved">Course Distributed</option>
                    </select>
                </div>
            }

            <div className="flex flex-col w-44">
                <label htmlFor="fromDate" className="text-xs font-medium mb-1 text-primary"> From Date </label>
                    <input className="px-3 py-2 border border-divider rounded-md text-sm"
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                    />
            </div>

            <div className="flex flex-col w-44">
                <label htmlFor="toDate" className="text-xs font-medium mb-1 text-primary"> To Date </label>
                    <input className="px-3 py-2 border border-divider rounded-md text-sm"
                        id="toDate"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                    />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 flex-grow min-w-[320px] self-end">
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryhover"
                    onClick={applyFilters}
                > 
                    Apply Filters 
                </button>
                <button className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-600"
                    onClick={clearFilters}
                >
                    Clear Filters
                </button>
                <button className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 flex items-center gap-2"
                    onClick={downloadUserReports}
                    disabled={downloading}
                >
                {
                    downloading ?
                    <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Downloading . . .
                    </>
                :
                    <>
                        <FontAwesomeIcon icon={faDownload} />
                        Download Reports
                    </>
                }
                </button>
            </div>
        </div>

        {/* Table */}
        <ScrollArea className="flex-grow border border-divider rounded-md overflow-auto">
            <table className="w-full text-left table-auto font-text text-sm text-primary border-collapse">
                <thead className="bg-primary text-white font-header">
                    <tr className="bg-primary text-white font-header">
                        <th className="sticky top-0 py-3 px-4 border border-divider bg-primary z-10">#</th>
                        <th className="sticky top-0 py-3 px-4 border border-divider bg-primary z-10">Action</th>
                        <th className="sticky top-0 py-3 px-4 border border-divider bg-primary z-10">Course Name</th>
                        <th className="sticky top-0 py-3 px-4 border border-divider bg-primary z-10">Date</th>
                        <th className="sticky top-0 py-3 px-4 border border-divider bg-primary z-10">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse border border-divider">
                            <td className="py-3 px-4 border border-divider">...</td>
                            <td className="py-3 px-4 border border-divider">Loading...</td>
                            <td className="py-3 px-4 border border-divider">...</td>
                            <td className="py-3 px-4 border border-divider">...</td>
                            <td className="py-3 px-4 border border-divider">...</td>
                        </tr>
                        ))
                    ) : filteredData.length === 0 ? (
                        <tr>
                        <td colSpan={5} className="text-center py-10 text-unactive border border-divider">
                            No activity found.
                        </td>
                        </tr>
                    ) : (
                        filteredData.map((log, index) => {
                        const date = new Date(log.created_at);
                        return (
                            <tr
                            key={log.id}
                            className="hover:bg-primarybg transition-all ease-in-out border border-divider hover:cursor-pointer"
                            onClick={() => setSelectedLog(log)}
                            >
                            <td className="py-3 px-4 border border-divider"> {(currentPage - 1) * itemsPerPage + (index + 1)} </td>
                            <td className="py-3 px-4 border border-divider">{log.Action}</td>
                            <td className="py-3 px-4 border border-divider">{log.Details?.['Course Name'] || 'N/A'}</td>
                            <td className="py-3 px-4 border border-divider">{date.toLocaleDateString()}</td>
                            <td className="py-3 px-4 border border-divider">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            </tr>
                        );
                        })
                    )}
                </tbody>
            </table>
        </ScrollArea>

        <div className="flex justify-between items-center mt-4 px-2">
            <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={loading || currentPage === 1}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
                Prev
            </button>

            <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                    pageNum =>
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 2
                )
                .map((pageNum, index, arr) => (
                    <React.Fragment key={pageNum}>
                    {index > 0 && arr[index - 1] !== pageNum - 1 && (
                        <span className="px-2">...</span>
                    )}
                    <button
                        onClick={() => !loading && setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`px-3 py-1 rounded ${
                        currentPage === pageNum
                            ? "bg-primary text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {pageNum}
                    </button>
                    </React.Fragment>
                ))}
            </div>

            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={loading || currentPage === totalPages}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
                Next
            </button>
        </div>

        {/* Modal */}
        <ActivityDetailsModal
          open={!!selectedLog}
          close={() => setSelectedLog(null)}
          selectedLog={selectedLog}
        />
      </div>
    </div>
  </>
);

}
