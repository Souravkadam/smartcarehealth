import { ReactNode, useState } from "react";

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsComponentProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function TabsComponent({
  tabs,
  defaultTab,
}: TabsComponentProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div>
      {/* Tab Headers */}
      <div className="border-b border-gray-200 flex gap-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-1 font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? "text-primary border-primary"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-6">{activeTabContent}</div>
    </div>
  );
}
