import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import "./tab-handler.css";

export default function TabHandler({ tabs, className, defaultTab, onTabChange, tab }: TabHandlerProps ) {
    const defaultTabId = defaultTab ? tabs.find((i) => i.id === defaultTab)?.id || tabs[0].id : tabs[0].id;
    const [selectedTab, setSelectedTab] = useState<string>(defaultTabId);
    const [renderedTabs, setRenderedTabs] = useState({ [defaultTabId]: true });

    useEffect(() => {
        if (tab && tabs.find((i) => i.id === tab)) {
            setSelectedTab(tab);
            setRenderedTabs((prev) => ({ ...prev, [tab]: true }));
        }
    }, [tab]);

    const changeTab = (tabId: string) => {
        // Change the selected tab
        setSelectedTab(tabId);
        setRenderedTabs((prev) => ({ ...prev, [tabId]: true }));

        if (onTabChange) {
            onTabChange(tabs.find((i) => i.id === tabId)!)
        }
    }

    return (
        <>
            <div className={cn("media-page-tabs", className)}>
                {tabs.map((tab) => (
                    <div 
                    key={tab.id} 
                    className={`media-tab${selectedTab === tab.id ? " selected" : "" }`}
                    onClick={() => changeTab(tab.id)}>
                        <p>{tab.title}</p>
                    </div>
                ))}
            </div>
            {tabs.map((tab) => (
                <div
                key={tab.id} 
                style={{display: selectedTab === tab.id ? "block" : "none", marginTop: "20px" }}>
                    {renderedTabs[tab.id] && tab.tab}
                </div>
            ))}
        </>
    );
}