// CourseVersionHistoryTab.jsx
import React from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus, faTrash, faUndo, faEdit} from '@fortawesome/free-solid-svg-icons';
import './CourseVersionHistoryTab.css';

const CourseVersionHistoryTab = ({ version }) => {
  if (!version) return null;

  const actionType = version?.Action || "";

  const thumbnailChange = version?.Changes?.find(c => c.field === "Thumbnail");
  const overviewChange = version?.Changes?.find(c => c.field === "Overview");
  const objectiveChange = version?.Changes?.find(c => c.field === "Objective");
  const lessonChange = version?.Changes?.find(c => c.field === "Lesson Content");
  const assessmentChange = version?.Changes?.find(c => c.field === "Assessment Content");
  const documentAttachmentChange = version?.Changes?.find(c => c.field === "FileName");
  const videoAttachmentChange = version?.Changes?.find(c => c.field === "VideoName");
  const creditorChange = version?.Changes?.find(c => c.field === "Creditor");

  const noDetailedChanges = 
    !thumbnailChange && 
    !overviewChange && 
    !objectiveChange && 
    !lessonChange && 
    !assessmentChange && 
    !documentAttachmentChange && 
    !videoAttachmentChange && 
    !creditorChange;

  const displayedChange =
    thumbnailChange ||
    overviewChange ||
    objectiveChange ||
    lessonChange ||
    assessmentChange ||
    documentAttachmentChange ||
    videoAttachmentChange ||
    creditorChange;

  const fieldTitles = {
    Thumbnail: "Thumbnail Changes",
    Overview: "Overview Changes",
    Objective: "Objective Changes",
    Lesson: "Lesson Changes",
    Assessment: "Assessment Changes",
    FileName: "File Changes",
    VideoName: "Video Changes",
    Creditor: "Creditor Changes",
  };

  const actionTitles = {
    "Added Content": "Content Added",
    "Deleted Content": "Content Deleted",
    "Restored Content": "Content Restored",
  };

  const headerTitle =
    (displayedChange?.field && fieldTitles[displayedChange.field]) ||
    actionTitles[version?.Action] ||
    version?.courseName ||
    "Content Updated";

  return (
    <div className="p-2">

      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 bg-gradient-to-b from-primary to-primary/40 rounded-full shadow-sm" />

          <div>
            <h2 className="font-header text-primary text-2xl font-semibold tracking-tight leading-tight">
              {headerTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Review the details of this version update.
            </p>
          </div>
        </div>

        <div className="mt-5 w-full border-t border-gray-300 relative">
          <div className="absolute left-0 top-0 w-80 border-t-4 border-primray/60 rounded-full shadow-[0_0_6px_rgba(var(--primary-rgb),0.4)]"/>
        </div>
      </div>


                {thumbnailChange && (
                  <div className="flex-grow overflow-auto">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded shadow-sm">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">Course Thumbnail Updated</h3>
                      <div className="flex gap-6">
                        <div className="flex flex-col gap-4 w-1/2">
                          <h4 className="font-semibold text-sm mb-2">Old Thumbnail</h4>
                          {thumbnailChange.old ? (
                            <img
                              src={thumbnailChange.old}
                              alt="Old Thumbnail"
                              className="max-h-40 object-contain border rounded bg-white p-2"
                            />
                          ) : (
                            <p className="italic text-gray-500">No previous thumbnail</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-4 w-1/2">
                          <h4 className="font-semibold text-sm mb-2">New Thumbnail</h4>
                          {thumbnailChange.new ? (
                            <img
                              src={thumbnailChange.new}
                              alt="New Thumbnail"
                              className="max-h-40 object-contain border rounded bg-white p-2"
                            />
                          ) : (
                            <p className="italic text-gray-500">No new thumbnail</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
      
                {/* Overview Changes */}
                {overviewChange &&  (
                  <div className="flex-grow overflow-auto">
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto">
                        <h4 className="font-semibold text-sm mb-2">Old</h4>
                        <div className="bg-gray-100 p-4 rounded border border-gray-300 text-base whitespace-pre-wrap break-words
                                    [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1"
                          dangerouslySetInnerHTML={{ __html: overviewChange.old }}
                        />
                      </div>
                      <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto">
                        <h4 className="font-semibold text-sm mb-2">New</h4>
                        <div className="bg-green-100 p-4 rounded border border-green-300 text-base whitespace-pre-wrap break-words
                                    [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1"
                          dangerouslySetInnerHTML={{ __html: overviewChange.new }}
                        />
                      </div>
                    </div>
                  </div>
                )}
      
                {/* Objective Changes */}
                {objectiveChange && (
                  <div className="flex-grow overflow-auto">
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto">
                        <h4 className="font-semibold text-sm mb-2">Old</h4>
                        <div className="bg-gray-100 p-4 rounded border border-gray-300 text-base whitespace-pre-wrap break-words
                                    [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1"
                          dangerouslySetInnerHTML={{ __html: objectiveChange.old }}
                        />
                      </div>
                      <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto">
                        <h4 className="font-semibold text-sm mb-2">New</h4>
                        <div className="bg-green-100 p-4 rounded border border-green-300 text-base whitespace-pre-wrap break-words
                                    [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1"
                          dangerouslySetInnerHTML={{ __html: objectiveChange.new }}
                        />
                      </div>
                    </div>
                  </div>
                )}
      
                {/* Lesson Changes - HTML to ah */}
                {lessonChange && (version.Action !== "Added Content" && version.Action !== "Deleted Content" && version.Action !== "Restored Content") && (
                  <div className="flex-grow overflow-auto space-y-8">
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                      <h3 className="text-xl font-semibold text-blue-700 mb-2 tracking-tight">
                        Summary of Changes
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {lessonChange.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">

                      <div className="flex flex-col rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                          <h4 className="font-semibold text-gray-700 text-sm">Old Version</h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-medium">Before</span>
                        </div>

                        <div className="p-4 min-h-[220px] max-h-[400px] overflow-auto">
                          <div
                            className="prose prose-sm max-w-full"
                            dangerouslySetInnerHTML={{
                              __html: lessonChange.old || "<p><em>No content</em></p>",
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col rounded-xl border border-green-300 bg-white shadow-sm overflow-hidden">
                        <div className="bg-green-50 px-4 py-2 border-b border-green-300 flex items-center justify-between">
                          <h4 className="font-semibold text-green-700 text-sm">New Version</h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800 font-medium">After</span>
                        </div>

                        <div className="p-4 min-h-[220px] max-h-[400px] overflow-auto">
                          <div
                            className="prose prose-sm max-w-full"
                            dangerouslySetInnerHTML={{
                              __html: lessonChange.new || "<p><em>No content</em></p>",
                            }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                )}
      
                {assessmentChange && (version.Action !== "Added Content" && version.Action !== "Deleted Content" && version.Action !== "Restored Content") && (
                      <div className="flex-grow overflow-auto space-y-8">
                        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                          <h3 className="text-xl font-semibold text-blue-700 mb-2 tracking-tight">
                            Summary of Changes
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {assessmentChange.summary}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">

                          <div className="flex flex-col rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                              <h4 className="font-semibold text-gray-700 text-sm">Old Version</h4>
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-medium">Before</span>
                            </div>

                            <div className="p-4 space-y-4 max-h-[400px] overflow-auto text-sm">
                              {Array.isArray(assessmentChange.old) && assessmentChange.old.length > 0 ? (
                                assessmentChange.old.map((q, idx) => (
                                  <div key={idx} className="border border-gray-300 p-3 rounded-lg bg-gray-50">
                                    <p className="font-semibold mb-1">Question {idx + 1}: {q.BlockData.question}</p>
                                    <ul className="ml-4 list-disc space-y-0.5">
                                      {q.BlockData.choices.map((choice, cIdx) => (
                                        <li
                                          key={cIdx}
                                          className={choice.isCorrect ? "text-green-600 font-semibold" : "text-gray-700"}
                                        >
                                          {choice.text} {choice.isCorrect ? "(Correct)" : ""}
                                        </li>
                                      ))}
                                    </ul>
                                    <p className="mt-1 text-xs text-gray-500">Points: {q.BlockData.points}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="italic text-gray-500">No old assessment data.</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col rounded-xl border border-green-300 bg-white shadow-sm overflow-hidden">
                            <div className="bg-green-50 px-4 py-2 border-b border-green-300 flex items-center justify-between">
                              <h4 className="font-semibold text-green-700 text-sm">New Version</h4>
                              <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800 font-medium">After</span>
                            </div>

                            <div className="p-4 space-y-4 max-h-[400px] overflow-auto text-sm">
                              {Array.isArray(assessmentChange.new) && assessmentChange.new.length > 0 ? (
                                assessmentChange.new.map((q, idx) => (
                                  <div key={idx} className="border border-green-300 p-3 rounded-lg bg-green-50">
                                    <p className="font-semibold mb-1">Question {idx + 1}: {q.BlockData.question}</p>
                                    <ul className="ml-4 list-disc space-y-0.5">
                                      {q.BlockData.choices.map((choice, cIdx) => (
                                        <li
                                          key={cIdx}
                                          className={choice.isCorrect ? "text-green-700 font-semibold" : "text-gray-700"}
                                        >
                                          {choice.text} {choice.isCorrect ? "(Correct)" : ""}
                                        </li>
                                      ))}
                                    </ul>
                                    <p className="mt-1 text-xs text-gray-500">Points: {q.BlockData.points}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="italic text-gray-500">No new assessment data.</p>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                  )}
      
                {/* Video Attachment Changes */}
                {videoAttachmentChange && (version.Action !== "Added Content" && version.Action !== "Deleted Content" && version.Action !== "Restored Content") && (
                  <div className="flex-grow overflow-auto">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded shadow-sm">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">Summary</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {version.Changes.length > 0 ? version.Changes[0].summary : "No summary available."}
                      </p>
                    </div>
      
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto border border-gray-300 rounded p-4 bg-gray-50">
                        <h4 className="font-semibold text-sm mb-2">Old</h4>
                        {version.Changes.map((change, idx) => (
                          <div key={idx} className="mb-4 text-xs whitespace-pre-wrap break-words">
                            <strong>{change.title}</strong>
                            <div>{change.old === null ? <em>null</em> : change.old}</div>
                          </div>
                        ))}
                      </div>
      
                      <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto border border-green-300 rounded p-4 bg-green-50">
                        <h4 className="font-semibold text-sm mb-2">New</h4>
                        {version.Changes.map((change, idx) => (
                          <div key={idx} className="mb-4 text-xs whitespace-pre-wrap break-words">
                            <strong>{change.title}</strong>
                            <div>{change.new}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
      
                {/* File Attachment Changes */}
                {documentAttachmentChange && (version.Action !== "Added Content" && version.Action !== "Deleted Content" && version.Action !== "Restored Content") && (
                  <div className="flex-grow overflow-auto">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded shadow-sm">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">Summary</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {version.Changes.length > 0 ? version.Changes[0].summary : "No summary available."}
                      </p>
                    </div>
      
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto border border-gray-300 rounded p-4 bg-gray-50">
                        <h4 className="font-semibold text-sm mb-2">Old</h4>
                        {version.Changes.map((change, idx) => (
                          <div key={idx} className="mb-4 text-xs whitespace-pre-wrap break-words">
                            <strong>{change.title}</strong>
                            <div>{change.old === null ? <em>null</em> : change.old}</div>
                          </div>
                        ))}
                      </div>
      
                      <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto border border-green-300 rounded p-4 bg-green-50">
                        <h4 className="font-semibold text-sm mb-2">New</h4>
                        {version.Changes.map((change, idx) => (
                          <div key={idx} className="mb-4 text-xs whitespace-pre-wrap break-words">
                            <strong>{change.title}</strong>
                            <div>{change.new}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
      
                {creditorChange && (
                  <div className="flex-grow overflow-auto">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded shadow-sm">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">Creditor Signature Updated</h3>
                      <div className="flex gap-6">
                        <div className="flex flex-col gap-4 w-1/2">
                          <h4 className="font-semibold text-sm mb-2">Old Signature</h4>
                          {creditorChange.old ? (
                            <img
                              src={creditorChange.old}
                              alt="Old Signature"
                              className="max-h-40 object-contain border rounded bg-white p-2"
                            />
                          ) : (
                            <p className="italic text-gray-500">No previous signature</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-4 w-1/2">
                          <h4 className="font-semibold text-sm mb-2">New Signature</h4>
                          {creditorChange.new ? (
                            <img
                              src={creditorChange.new}
                              alt="New Signature"
                              className="max-h-40 object-contain border rounded bg-white p-2"
                            />
                          ) : (
                            <p className="italic text-gray-500">No new signature</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
      
                {actionType === "Added Content" && (
                  <div className="flex-grow overflow-auto">
                    <div className="bg-green-50/70 border border-green-200 rounded-xl p-6 shadow-sm h-full flex flex-col">

                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-3 rounded-full">
                            <FontAwesomeIcon icon={faPlus} className="text-green-700 text-xl" />
                          </div>
                          <div>
                            <h3 className="text-green-800 text-2xl font-semibold">New Content Added</h3>
                            <p className="text-green-700 text-sm">Recently added items</p>
                          </div>
                        </div>
                      </div>

                      {/* Content List */}
                      <div className="space-y-4 overflow-auto pr-1 flex-grow">
                        {version?.Changes && Object.keys(version.Changes).length > 0 ? (
                          Object.values(version.Changes)
                            .flat()
                            .map((change, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-green-100 rounded-lg px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-150"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-green-800 text-base font-semibold mb-1">
                                      {change.title || `${change.field} Added`}
                                    </h4>

                                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                                      {(change.title === "Video File Uploaded" ||
                                        change.title === "Document File Uploaded") &&
                                      change.new ? (
                                        <a
                                          href={change.new}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-green-700 font-medium underline hover:text-green-800 transition-colors"
                                        >
                                          {change.title === "Video File Uploaded"
                                            ? "View Uploaded Video"
                                            : "View Uploaded Document"}
                                        </a>
                                      ) : (
                                        change.new || "Untitled"
                                      )}
                                    </p>
                                  </div>

                                  {/* Right status badge */}
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                    Added
                                  </span>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-gray-600 italic">No content details available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

      
                {actionType === "Deleted Content" && (
                  <div className="flex-grow overflow-auto">
                    <div className="bg-red-50 border border-red-200 rounded p-6 space-y-4">
                      <div className="flex items-center gap-2 text-red-700 font-semibold text-lg">
                        <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                        <span>New Content Deleted</span>
                      </div>
      
                      <div className="space-y-4">
                        {version?.Changes && Object.keys(version.Changes).length > 0 ? (
                          Object.values(version.Changes)
                            .flat() // flatten arrays of changes into one array
                            .map((change, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-red-100 rounded-md px-4 py-3 shadow-sm"
                              >
                                <h4 className="text-red-800 text-sm font-medium mb-1">
                                  {change.title || `${change.field} Added`}
                                </h4>
                                <p className="text-sm text-gray-800 break-words">
                                  {change.old || "Untitled"}
                                </p>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-gray-600 italic">No content details available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
      
                {actionType === "Restored Content" && (
                  <div className="flex-grow overflow-auto">
                    <div className="bg-blue-50 border border-blue-200 rounded p-6 space-y-4">
                      <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
                        <FontAwesomeIcon icon={faUndo} className="text-blue-600" />
                        <span>Content Restored</span>
                      </div>
      
                      <div className="space-y-4">
                        {version?.Changes && Object.keys(version.Changes).length > 0 ? (
                          Object.values(version.Changes)
                            .flat() // flatten arrays of changes into one array
                            .map((change, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-blue-100 rounded-md px-4 py-3 shadow-sm"
                              >
                                <h4 className="text-blue-800 text-sm font-medium mb-1">
                                  {change.title || `${change.field} Restored`}
                                </h4>
                                <p className="text-sm text-gray-800 break-words">
                                  {change.new || "Untitled"}
                                </p>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-gray-600 italic">No content details available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
      
                {(actionType === "Updated Lesson Details" || actionType === "Updated Assessment Details" || actionType === "Updated Attachment Details") && (
                  <div className="flex-grow overflow-auto">
                    <div className="bg-blue-50 border border-blue-200 rounded p-6 space-y-4">
                      <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
                        <FontAwesomeIcon icon={faEdit} className="text-blue-600" />
                        <span>{actionType === "Updated Lesson Details" ? "Lesson Details Updated" : "Assessment Details Updated"}</span>
                      </div>
      
                      {version?.Changes && version.Changes.length > 0 ? (
                        version.Changes.map((change, idx) => {
                          const oldVal = change.old ?? "—";
                          const newVal = change.new ?? "—";
      
                          return (
                            <div
                              key={idx}
                              className="bg-white border border-blue-100 rounded-md px-4 py-4 shadow-sm"
                            >
                              <h4 className="text-blue-800 text-sm font-medium mb-2">{change.field} Updated</h4>
                              <div className="flex gap-6">
                                <div className="flex flex-col gap-1 w-1/2 p-2 border border-gray-300 rounded bg-gray-50">
                                  <h5 className="font-semibold text-xs">Old</h5>
                                  <p className="text-sm text-gray-800 break-words">{oldVal}</p>
                                </div>
                                <div className="flex flex-col gap-1 w-1/2 p-2 border border-green-300 rounded bg-green-50">
                                  <h5 className="font-semibold text-xs">New</h5>
                                  <p className="text-sm text-gray-800 break-words">{newVal}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-600 italic">No details updated.</p>
                      )}
                    </div>
                  </div>
                )}
      
                {/* Fallback summary */}
                {noDetailedChanges && actionType !== "Added Content" && !["Updated Lesson Details", "Updated Assessment Details", "Updated Attachment Details"].includes(actionType) && (
                  <div className="flex-grow overflow-auto">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {version?.Changes?.length > 0
                        ? version.Changes.map((c, idx) => (
                            <div key={idx} className="mb-2">
                              <strong>{c.title || c.field}:</strong> {c.summary || "No summary available."}
                            </div>
                          ))
                        : "No summary available."}
                    </p>
                  </div>
                )}

    </div>
  );
};

export default CourseVersionHistoryTab;
