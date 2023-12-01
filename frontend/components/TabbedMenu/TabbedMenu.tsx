import React, { useState, useEffect } from 'react';
import styles from './TabbedMenu.module.scss';
import { RecursiveDropdown } from '../RecursiveDropDown'; // Adjust the import path as necessary

interface TabbedMenuProps {
  tabsData: { [key: string]: object };
}

const TabbedMenu: React.FC<TabbedMenuProps> = ({ tabsData }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (tabsData && Object.keys(tabsData).length > 0) {
      setActiveTab(Object.keys(tabsData)[0]);
    }
  }, [tabsData]);

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  // Check if tabsData is well-defined and not empty
  if (!tabsData || Object.keys(tabsData).length === 0) {
    // Optionally, render some placeholder or loading indicator
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.tabContainer}>
      <ul className={styles.tabMenu}>
        {Object.keys(tabsData).map((tabKey) => (
          <li
            key={tabKey}
            className={tabKey === activeTab ? styles.active : ''}
            onClick={() => handleTabClick(tabKey)}
          >
            {tabKey}
          </li>
        ))}
      </ul>
      <div className={styles.tabContent}>
        {/* Render the RecursiveDropdown component with the dictionary prop */}
        {activeTab && <RecursiveDropdown dictionary={tabsData[activeTab]} />}
      </div>
    </div>
  );
};

export default TabbedMenu;

