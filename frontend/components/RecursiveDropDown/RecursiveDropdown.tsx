import { useState, FC } from 'react';

// TODO: Use these or other official heroicons (can use Material UI or others as well)
// import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/solid';

import styles from './RecursiveDropdown.module.scss';

type DropdownData = Record<string, DropdownValue>;

type DropdownValue = string | number | boolean | NestedObject | undefined;

type NestedObject = {
  [key: string]: DropdownValue;
  satisfied?: boolean;
};

type DropdownProps = {
  data: DropdownData;
};

type SatisfactionStatusProps = {
  satisfied: boolean;
};

const SatisfactionStatus: FC<SatisfactionStatusProps> = ({ satisfied }) => (
  <span style={{ marginLeft: '10px', color: satisfied ? 'green' : 'red' }}>
    {satisfied ? '✅' : '❌'}
  </span>
);

const Dropdown: FC<DropdownProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({});

  const toggleDropdown = (key: string) => () => {
    setIsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderContent = (data: DropdownData) => {
    return Object.entries(data).map(([key, value]) => {
      const isObject = typeof value === 'object' && value !== null;
      let satisfactionElement = null;

      if (isObject) {
        const nestedValue = value as NestedObject;
        if ('satisfied' in nestedValue) {
          satisfactionElement = <SatisfactionStatus satisfied={nestedValue.satisfied ?? false} />;
        }
      }

      return (
        <li key={key} className={isObject ? styles.category : styles.item}>
          <div
            className={styles.categoryTitle}
            onClick={isObject ? toggleDropdown(key) : undefined}
          >
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

  return <ul className={styles.dropdown}>{renderContent(data)}</ul>;
};

type RecursiveDropdownProps = {
  dictionary: DropdownData;
};

const RecursiveDropdown: FC<RecursiveDropdownProps> = ({ dictionary }) => {
  return (
    <div className={styles.recursiveDropdownContainer}>
      <Dropdown data={dictionary} />
    </div>
  );
};

export default RecursiveDropdown;
