import React, { createContext, useContext, useRef } from "react";
import Sidebar, { SidebarRef } from "../components/Sidebar";

type SidebarContextShape = {
    openSidebar: () => void;
    closeSidebar: () => void;
    setOnChatSelect: (callback: (chatId: string) => void) => void;
};

const SidebarContext = createContext<SidebarContextShape>({
    openSidebar: () => { },
    closeSidebar: () => { },
    setOnChatSelect: () => { },
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const sidebarRef = useRef<SidebarRef>(null);
    const [onChatSelect, setOnChatSelect] = React.useState<((chatId: string) => void) | undefined>();

    const openSidebar = () => sidebarRef.current?.open();
    const closeSidebar = () => sidebarRef.current?.close();

    const handleChatSelect = (chatId: string) => {
        if (onChatSelect) {
            onChatSelect(chatId);
        }
    };

    const updateOnChatSelect = (callback: (chatId: string) => void) => {
        setOnChatSelect(() => callback);
    };

    return (
        <SidebarContext.Provider
            value={{ 
                openSidebar, 
                closeSidebar,
                setOnChatSelect: updateOnChatSelect
            }}
        >
            {children}
            <Sidebar ref={sidebarRef} onChatSelect={handleChatSelect} />
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
