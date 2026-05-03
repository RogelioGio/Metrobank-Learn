import React from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus, faTrash, faUndo, faEdit} from '@fortawesome/free-solid-svg-icons';
import './CourseVersionHistoryModal.css';

const CourseVersionHistoryModal = ({ isOpen, onClose, version }) => {
console.log(version);

  const actionType = version?.Action || "";

  const thumbnailChange = version?.Changes?.find(change => change.field === "Thumbnail");
  const overviewChange = version?.Changes?.find(change => change.field === "Overview");
  const objectiveChange = version?.Changes?.find(change => change.field === "Objective");
  const lessonChange = version?.Changes?.find(change => change.field === "Lesson Content");
  const assessmentChange = version?.Changes?.find(change => change.field === "Assessment Content");
  const documentAttachmentChange = version?.Changes?.find(change => change.field === "FileName");
  const videoAttachmentChange = version?.Changes?.find(change => change.field === "VideoName");
  const creditorChange = version?.Changes?.find(change => change.field === "Creditor");

  const noDetailedChanges = 
  !thumbnailChange && 
  !overviewChange && 
  !objectiveChange && 
  !lessonChange && 
  !assessmentChange && 
  !documentAttachmentChange && 
  !videoAttachmentChange && 
  !creditorChange;

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

  const displayedChange =
    thumbnailChange ||
    overviewChange ||
    objectiveChange ||
    lessonChange ||
    assessmentChange ||
    documentAttachmentChange ||
    videoAttachmentChange ||
    creditorChange;

  const headerTitle =
    (displayedChange?.field && fieldTitles[displayedChange.field]) ||
    actionTitles[version?.Action] ||
    version?.courseName ||
    "Content Updated";

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <DialogPanel className="version-history-modal w-[1000px] max-w-full min-h-[600px] max-h-[90vh] transform overflow-auto rounded-lg bg-white text-left shadow-xl transition-all flex flex-col">

          {/* Header */}
          <div className="bg-gradient-to-b from-[hsl(239,94%,19%)] via-[hsl(214,97%,27%)] to-[hsl(201,100%,36%)] rounded-t-md">
            <div className="flex flex-col bg-gradient-to-b from-transparent to-black rounded-t-md gap-4">
              <div className="p-4 flex flex-col gap-y-4">
                {/* Header row: course name left, close button right */}
                <div className="flex items-center justify-between">
                  <div className="px-4">
                    <h2 className="font-header text-white text-base md:text-2xl">
                      {headerTitle}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    aria-label="Close modal"
                    className="border-2 border-white rounded-full text-white flex items-center justify-center hover:bg-white hover:text-primary hover:cursor-pointer transition-all ease-in-out
                      w-6 h-6 text-sm
                      md:w-8 md:h-8 md:text-base"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                {/* Version info below */}
                <div className="px-4">
                  <p className="text-xs text-white font-text break-words">
                    Version {version?.formattedVersion} — by {version?.User || version?.user} on{" "}
                    {version?.Date ? new Date(version.Date || version.date).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {thumbnailChange && (
            <div className="px-6 py-4 flex-grow overflow-auto">
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
            <div className="px-6 py-4 flex-grow overflow-auto">
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
            <div className="px-6 py-4 flex-grow overflow-auto">
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
            <div className="px-6 py-4 flex-grow overflow-auto">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded shadow-sm">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{lessonChange.summary}</p>
              </div>
              <div className="flex gap-6">
                <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto border border-gray-300 rounded p-4 bg-gray-50">
                  <h4 className="font-semibold text-sm mb-2">Old</h4>
                  <div
                    className="prose prose-sm max-w-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: lessonChange.old || "<p><em>No content</em></p>" }}
                  />
                </div>

                <div className="flex flex-col gap-4 w-1/2 min-h-[200px] max-h-[400px] overflow-auto border border-green-300 rounded p-4 bg-green-50">
                  <h4 className="font-semibold text-sm mb-2">New</h4>
                  <div
                    className="prose prose-sm max-w-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: lessonChange.new || "<p><em>No content</em></p>" }}
                  />
                </div>
              </div>
            </div>
          )}

          {assessmentChange && (version.Action !== "Added Content" && version.Action !== "Deleted Content" && version.Action !== "Restored Content") && (
            <div className="px-6 py-4 flex-grow overflow-auto">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded shadow-sm">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{assessmentChange.summary}</p>
              </div>
            
              <div className="flex flex-col gap-4">
                <div className="flex gap-6">
                  {/* OLD QUESTIONS */}
                  <div className="w-1/2">
                    <h5 className="font-semibold text-sm mb-2">Old</h5>
                    <div className="bg-gray-100 p-4 rounded border border-gray-300 text-xs space-y-4 max-h-[400px] overflow-auto">
                      {Array.isArray(assessmentChange.old) && assessmentChange.old.length > 0 ? (
                        assessmentChange.old.map((q, idx) => (
                          <div key={idx} className="border border-gray-300 p-2 rounded bg-white">
                            <p className="font-semibold">Question {idx + 1}: {q.BlockData.question}</p>
                            <ul className="ml-4 list-disc">
                              {q.BlockData.choices.map((choice, cIdx) => (
                                <li key={cIdx} className={choice.isCorrect ? "text-green-600 font-semibold" : ""}>
                                  {choice.text} {choice.isCorrect ? "(Correct)" : ""}
                                </li>
                              ))}
                            </ul>
                            <p className="mt-1 text-xs text-gray-600">Points: {q.BlockData.points}</p>
                          </div>
                        ))
                      ) : (
                        <p className="italic text-gray-500">No old assessment data.</p>
                      )}
                    </div>
                  </div>

                  {/* NEW QUESTIONS */}
                  <div className="w-1/2">
                    <h5 className="font-semibold text-sm mb-2">New</h5>
                    <div className="bg-green-50 p-4 rounded border border-green-300 text-xs space-y-4 max-h-[400px] overflow-auto">
                      {Array.isArray(assessmentChange.new) && assessmentChange.new.length > 0 ? (
                        assessmentChange.new.map((q, idx) => (
                          <div key={idx} className="border border-green-300 p-2 rounded bg-white">
                            <p className="font-semibold">Question {idx + 1}: {q.BlockData.question}</p>
                            <ul className="ml-4 list-disc">
                              {q.BlockData.choices.map((choice, cIdx) => (
                                <li key={cIdx} className={choice.isCorrect ? "text-green-600 font-semibold" : ""}>
                                  {choice.text} {choice.isCorrect ? "(Correct)" : ""}
                                </li>
                              ))}
                            </ul>
                            <p className="mt-1 text-xs text-gray-600">Points: {q.BlockData.points}</p>
                          </div>
                        ))
                      ) : (
                        <p className="italic text-gray-500">No new assessment data.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Attachment Changes */}
          {videoAttachmentChange && (version.Action !== "Added Content" && version.Action !== "Deleted Content" && version.Action !== "Restored Content") && (
            <div className="px-6 py-4 flex-grow overflow-auto">
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
            <div className="px-6 py-4 flex-grow overflow-auto">
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
            <div className="px-6 py-4 flex-grow overflow-auto">
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
            <div className="px-6 py-4 flex-grow overflow-auto">
              <div className="bg-green-50 border border-green-200 rounded p-6 space-y-4">
                <div className="flex items-center gap-2 text-green-700 font-semibold text-lg">
                  <FontAwesomeIcon icon={faPlus} className="text-green-600" />
                  <span>New Content Added</span>
                </div>

                <div className="space-y-4">
                  {version?.Changes && Object.keys(version.Changes).length > 0 ? (
                    Object.values(version.Changes)
                      .flat() // flatten arrays of changes into one array
                      .map((change, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-green-100 rounded-md px-4 py-3 shadow-sm"
                        >
                          <h4 className="text-green-800 text-sm font-medium mb-1">
                            {change.title || `${change.field} Added`}
                          </h4>
                          <p className="text-sm text-gray-800 break-words">
                            {(change.title === "Video File Uploaded" || change.title === "Document File Uploaded") && change.new ? (
                              <a
                                href={change.new}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-700 underline"
                              >
                                {change.title === "Video File Uploaded"
                                  ? "Uploaded New Attachment"
                                  : "Uploaded New Document"}
                              </a>
                            ) : (
                              change.new || "Untitled"
                            )}
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

          {actionType === "Deleted Content" && (
            <div className="px-6 py-4 flex-grow overflow-auto">
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
            <div className="px-6 py-4 flex-grow overflow-auto">
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

          {(actionType === "Updated Lesson Details" || actionType === "Updated Assessment Details") && (
            <div className="px-6 py-4 flex-grow overflow-auto">
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
          {noDetailedChanges && actionType !== "Added Content" && !["Updated Lesson Details", "Updated Assessment Details"].includes(actionType) && (
            <div className="px-6 py-4 flex-grow overflow-auto">
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

        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default CourseVersionHistoryModal;
