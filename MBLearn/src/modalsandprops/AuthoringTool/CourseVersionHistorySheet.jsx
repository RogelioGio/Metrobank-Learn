import React from "react";

const CourseVersionHistorySheet = ({ versions, onSelectVersion }) => {
  const getChangeSummary = (changes, action) => {
    const counts = {};

    changes.forEach((change) => {
      const field = change.field || "Unknown";
      counts[field] = (counts[field] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([field, count]) => {
        if (action === "Added Content") {
          return `${count} ${field}${count > 1 ? "s" : ""}`;
        } else {
          return field;
        }
      })
      .join(", ");
  };

  const getVersionByIndex = (index, totalVersions) => {
    let position = totalVersions - 1 - index; // reverse order
    let major = 1;
    let minor = position;

    while (minor > 9) {
      major += 1;
      minor -= 10;
    }

    return `${major}.${minor}`;
  };

  return (
    <>
      <div>
        <h1 className="font-header text-2xl text-primary">Version History</h1>
        <p className="text-md font-text text-unactive text-xs mb-4">
          Here you can review all previous versions of this course.
        </p>
      </div>

      <div className="flex flex-col gap-4 overflow-auto max-h-[80vh]">

        {versions.length > 0 ? (
          versions.map((version, index) => {
            const formattedVersion = getVersionByIndex(index, versions.length);

            const actionVerb =
              version.Action === "Added Content"
                ? "Added"
                : version.Action === "Deleted Content"
                ? "Deleted"
                : version.Action === "Restored Content"
                ? "Restored"
                : "Updated";

            const summary = getChangeSummary(version.Changes, version.Action);

            return (
              <div
                key={formattedVersion}
                role="button"
                tabIndex={0}
                onClick={() => onSelectVersion(version, formattedVersion)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectVersion(version, formattedVersion);
                  }
                }}
                className="cursor-pointer border border-divider rounded-md p-4 bg-white hover:bg-gray-100 transition-shadow shadow-sm"
              >
                <p className="font-semibold text-primary">
                  <span>{actionVerb}:</span>{" "}
                  <span className="font-normal text-primary/60">{summary}</span>
                </p>
                <p className="text-xs text-unactive">
                  Version {formattedVersion} — {version.User} —{" "}
                  {new Date(version.Date).toLocaleDateString()}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-unactive italic font-text text-sm">
            No version history available.
          </p>
        )}

      </div>
    </>
  );
};

export default CourseVersionHistorySheet;
