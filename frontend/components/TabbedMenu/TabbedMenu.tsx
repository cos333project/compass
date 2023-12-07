import { useState, useEffect, FC } from 'react';

import { RecursiveDropdown } from '../RecursiveDropDown';

import styles from './TabbedMenu.module.scss';

interface TabbedMenuProps {
  tabsData: { [key: string]: object };
  refresh: number;
}

const TabbedMenu: FC<TabbedMenuProps> = ({ tabsData, refresh }) => {
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
        {activeTab && <RecursiveDropdown key={`${refresh}`} dictionary={tabsData[activeTab]} />}
      </div>
    </div>
  );
};

export default TabbedMenu;
