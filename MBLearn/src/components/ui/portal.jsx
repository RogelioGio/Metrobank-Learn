import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PortalToolTip = ({ children, anchorRef, visible, position = "bottom", offset = 8 }) => {
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const portalRef = useRef(null);

    useEffect(() => {
        if (!anchorRef.current || !visible || !portalRef.current) return;

        // Wait for the portal to be rendered
        const frame = requestAnimationFrame(() => {
            const anchorRect = anchorRef.current.getBoundingClientRect();
            const portalRect = portalRef.current.getBoundingClientRect();

            const scrollX = window.scrollX;
            const scrollY = window.scrollY;

            let top = 0;
            let left = 0;

            switch (position) {
                case "bottom":
                    top = anchorRect.bottom + offset + scrollY;
                    left = anchorRect.left + (anchorRect.width - portalRect.width) / 2 + scrollX;
                    break;
                case "left":
                    top = anchorRect.top + (anchorRect.height - portalRect.height) / 2 + scrollY;
                    left = anchorRect.left - portalRect.width - offset + scrollX;
                    break;
                case "right":
                    top = anchorRect.top + (anchorRect.height - portalRect.height) / 2 + scrollY;
                    left = anchorRect.right + offset + scrollX;
                    break;
                case "left-top":
                    top = anchorRect.top + scrollY;
                    left = anchorRect.left - portalRect.width - offset + scrollX;
                    break;
                case "right-bottom":
                    top = anchorRect.bottom - portalRect.height + scrollY;
                    left = anchorRect.right + offset + scrollX;
                    break;
                default:
                    break;
            }

            setCoords({ top, left });
        });

        return () => cancelAnimationFrame(frame);
    }, [anchorRef, visible, position, offset]);

    if (!visible) return null;

    return createPortal(
        <div
            ref={portalRef}
            style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
                zIndex: 1000,
            }}
            className="font-text p-2 text-xs bg-tertiary text-white rounded-sm whitespace-nowrap shadow-lg transition-opacity ease-in-out duration-100"
        >
            {children}
        </div>,
        document.body
    );
};

export default PortalToolTip;
