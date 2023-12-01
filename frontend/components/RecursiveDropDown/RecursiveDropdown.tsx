import React, { useState, FC } from 'react';
import styles from './RecursiveDropdown.module.scss';

interface Dictionary {
  [key: string]: any;
}

interface DropdownProps {
  data: Dictionary;
}

interface SatisfactionStatusProps {
  satisfied: string;
}

const SatisfactionStatus: FC<SatisfactionStatusProps> = ({ satisfied }) => (
  <span style={{ marginLeft: '10px', color: satisfied === 'True' ? 'green' : 'red' }}>
    {satisfied === 'True' ? '✅' : '❌'}
  </span>
);

const Dropdown: FC<DropdownProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});

  const toggleDropdown = (key: string) => () => {
    setIsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderContent = (data: Dictionary) => {
    return Object.entries(data).map(([key, value]) => {
      const isObject = typeof value === 'object' && value !== null;
      let satisfactionElement = null;

      if (isObject && 'satisfied' in value) {
        satisfactionElement = <SatisfactionStatus satisfied={value.satisfied} />;
        // Remove 'satisfied' from the value to be rendered
        const { satisfied, ...rest } = value;
        value = rest;
      }

      return (
        <li key={key} className={isObject ? styles.category : styles.item}>
          <div className={styles.categoryTitle} onClick={isObject ? toggleDropdown(key) : undefined}>
            {isObject && <span className={styles.indicator}>{isOpen[key] ? '-' : '>'}</span>}
            {key}
            {satisfactionElement}
          </div>
          {isObject && (
            <ul className={`${styles.nested} ${isOpen[key] ? styles.active : ''}`}>
              <Dropdown data={value} />
            </ul>
          )}
          {!isObject && <div className={styles.item}>{value}</div>}
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
