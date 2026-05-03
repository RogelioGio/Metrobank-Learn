import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PopoverContext = createContext();

export const CustomPopover = ({children, offset = 8}) => {
    const [open, setopen] = useState(false);
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef(null);
    const contentRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        let timeout
        const anchorRect = triggerRef.current.getBoundingClientRect();
        const portalRect = contentRef.current.getBoundingClientRect();

        if (triggerRef.current && contentRef.current) {

            const top = anchorRect.bottom - portalRect.height + window.scrollY;
            const left = anchorRect.right + offset + window.scrollX;

            setPosition({ top, left });
        }

        if (!open) {
            const top = anchorRect.bottom - portalRect.height + window.scrollY;
            const left = anchorRect.right + offset + window.scrollX;

            timeout = setTimeout(() => {
            setVisible(false);
            //setPosition({ top, left });
            }, 200);
        }else {
            timeout = setTimeout(() => {
            setVisible(true);
            //setPosition({ top, left });
            }, 500);
        }

    return () => clearTimeout(timeout);

    },[open, contentRef]);

    useEffect(()=>{console.log(position),[position]})

    return(
        <PopoverContext.Provider value={{open,visible,setopen, triggerRef, contentRef, position}}>
            <div className="relative inline-block">
                {children}
            </div>
        </PopoverContext.Provider>
    )
}

CustomPopover.Trigger = ({children}) => {
    const {open, setopen, triggerRef } = useContext(PopoverContext);

    return (
        <div ref={triggerRef} onClick={() => setopen(!open)} className="cursor-pointer">
            {children}
        </div>
    )
};

CustomPopover.Content  = ({children}) => {
    const context = useContext(PopoverContext);
    if (!context) throw new Error("CustomPopover.Content must be used within <CustomPopover>");
    const { open, contentRef, position, visible } = context;
    return createPortal (
        <div ref={contentRef}
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                zIndex: 1000,
                pointerEvents: visible ? 'auto' : 'none',
            }}
            className={`transition-all ease-in-out ${visible ? "opacity-100":"opacity-0"}`}>
            {children}
        </div>,
        document.body
    )
}

