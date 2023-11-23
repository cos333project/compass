import React, { useState, FC } from 'react';
import styles from './RecursiveDropdown.module.scss';

type Dictionary = {
  [key: string]: any;
};

interface DropdownProps {
  data: Dictionary;
}

const Dropdown: FC<DropdownProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});

  const toggleDropdown = (key: string) => () => {
    setIsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderContent = (data: Dictionary) => {
    return Object.entries(data).map(([key, value]) => {
      const isObject = typeof value === 'object' && value !== null && !(value instanceof Array);
      return (
        <li key={key} className={isObject ? styles.category : styles.item}>
          {isObject ? (
            <>
              <div className={styles.categoryTitle} onClick={toggleDropdown(key)}>
                <span className={styles.indicator}>{isOpen[key] ? '-' : '>'}</span>
                {key}
              </div>
              {isOpen[key] && <ul className={`${styles.nested} ${isOpen[key] ? styles.active : ''}`}>
                <Dropdown data={value} />
              </ul>}
            </>
          ) : (
            <span>{key}</span>
          )}
        </li>
      );
    });
  };

  return (
    <ul className={styles.dropdown}>
      {renderContent(data)}
    </ul>
  );
};

interface RecursiveDropdownProps {
  dictionary: Dictionary;
}

const RecursiveDropdown: FC<RecursiveDropdownProps> = ({ dictionary }) => {
  return (
    <div className={styles.recursiveDropdownContainer}>
      <Dropdown data={dictionary} />
    </div>
  );
};

export default RecursiveDropdown;


