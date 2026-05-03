import React from "react";

const AttachmentPreview = ({ attachment }) => {
    if (!attachment) return <div>No attachment provided.</div>;

    console.log("attachment preview", attachment);

    const {
        title,
        type,
        attachmentType,
        filePath,
        videoPath,
        AttachmentDescription
    } = attachment;

    const isLink = attachmentType === "link";

    const fullFileUrl = filePath || "";
    const fullVideoUrl = videoPath || "";

    const getEmbedUrl = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    const renderFilePreview = () => {
        if (!fullFileUrl) return <p className="text-red-500">No file URL provided.</p>;

        if (isLink) {
            return (
                <a
                    href={fullFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                >
                    Open Document Link
                </a>
            );
        }

        if (fullFileUrl.toLowerCase().endsWith(".pdf")) {
            return (
                <embed
                    src={fullFileUrl}
                    type="application/pdf"
                    width="100%"
                    height="650px"
                    className="rounded"
                    onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.innerHTML = `<p class="text-red-500">Failed to load PDF.</p>`;
                    }}
                />
            );
        }

        return (
            <a
                href={fullFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primaryhover"
            >
                Download File
            </a>
        );
    };

    const renderVideoPreview = () => {
        if (!fullVideoUrl) return <p className="text-red-500">No video URL provided.</p>;

        if (isLink) {
            const embedUrl = getEmbedUrl(fullVideoUrl);
            if (!embedUrl)
                return <p className="text-red-500">Invalid YouTube URL format.</p>;

            return (
                <div className="aspect-video">
                    <iframe
                        src={embedUrl}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-md"
                    ></iframe>
                </div>
            );
        }

        return (
            <video
                controls
                src={fullVideoUrl}
                className="w-full rounded-md"
                onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML = `<p class="text-red-500">Failed to load video.</p>`;
                }}
            >
                Your browser does not support the video tag.
            </video>
        );
    };

    return (
        <div className="flex flex-col gap-4 pt-4">

            {/* Description Section */}
            {type !== "file" && (
                <div className="flex flex-col gap-2 border-b pb-4">
                    <p className="font-header text-xl text-primary">Attachment Description</p>
                    <p className="font-text text-xs text-unactive">
                        {AttachmentDescription || "No course objective found."}
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {type === "file" && renderFilePreview()}
                {type === "video" && renderVideoPreview()}
            </div>
        </div>
    );
};

export default AttachmentPreview;
