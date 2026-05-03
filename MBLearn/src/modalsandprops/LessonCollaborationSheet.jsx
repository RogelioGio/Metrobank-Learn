import React from "react";

const sampleContributions = [
  { User: "Alice Johnson", Date: "2025-10-30T10:15:00Z" },
  { User: "Bob Smith", Date: "2025-10-29T14:20:00Z" },
  { User: "Carol Lee", Date: "2025-10-28T09:50:00Z" },
];

const LessonCollaborationSheet = ({ contributions = sampleContributions, openContributionModal }) => {

  const sortedContributions = [...contributions].sort(
    (a, b) => new Date(b.Date) - new Date(a.Date)
  );

  const totalContributions = sortedContributions.length;

  return (
    <div className="flex flex-col gap-4 overflow-auto max-h-[70vh] mt-4">
      {sortedContributions.length > 0 ? (
        sortedContributions.map((contrib, index) => {
          const contributionNumber = totalContributions - index;

          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => openContributionModal?.(contrib, contributionNumber)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openContributionModal?.(contrib, contributionNumber);
                }
              }}

              className="cursor-pointer border border-divider rounded-md p-4 bg-white hover:bg-gray-100 transition-shadow shadow-sm"
            >
              <p className="font-semibold text-primary">
                Contribution {contributionNumber}
              </p>
              <p className="text-xs text-unactive">
                {contrib.User} — {new Date(contrib.Date).toLocaleDateString()}{" "}
                {new Date(contrib.Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          );
        })
      ) : (
        <p className="text-unactive italic font-text text-sm">
          No collaborator contributions available.
        </p>
      )}
    </div>
  );
};

export default LessonCollaborationSheet;
