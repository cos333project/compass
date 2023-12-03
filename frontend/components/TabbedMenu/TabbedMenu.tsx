import { useState, useEffect } from 'react';

import { Dictionary } from '@/types';

import { RecursiveDropdown } from '../RecursiveDropDown'; // Adjust the import path as necessary

import styles from './TabbedMenu.module.scss';

type TabsData = {
  [tabName: string]: string | Dictionary;
};

type TabbedMenuProps = {
  tabsData: TabsData;
};

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

  if (!tabsData || Object.keys(tabsData).length === 0) {
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
        {activeTab && typeof tabsData[activeTab] !== 'string' && (
          <RecursiveDropdown dictionary={tabsData[activeTab] as Dictionary} />
        )}
      </div>
    </div>
  );
};

export default TabbedMenu;
