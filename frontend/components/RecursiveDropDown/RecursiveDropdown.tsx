import { useState, FC } from 'react';

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

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
  <span className='ml-2 statusIcon'>
    {satisfied ? (
      <CheckCircleIcon className='w-5 h-5 text-green-500' />
    ) : (
      <XCircleIcon className='w-5 h-5 text-red-500' />
    )}
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
        <li key={key} className={isObject ? 'mb-2' : ''}>
          <div
            className={`flex justify-between items-center p-2 cursor-pointer ${
              isObject ? 'bg-gray-200 rounded' : 'bg-gray-100'
            }`}
            onClick={isObject ? toggleDropdown(key) : undefined}
          >
            {isObject && (
              <>
                <span className={`mr-2 text-lg ${isOpen[key] ? 'transform rotate-90' : ''}`}></span>
                <span className='flex-grow'>{key}</span>
              </>
            )}
            {!isObject && <span>{key}</span>}
            {satisfactionElement}
          </div>
          {isObject && (
            <ul className={`pl-4 ${isOpen[key] ? 'block' : 'hidden'}`}>
              <Dropdown data={value} />
            </ul>
          )}
        </li>
      );
    });
  };

  return <ul className='list-none p-0 m-0'>{renderContent(data)}</ul>;
};

type RecursiveDropdownProps = {
  dictionary: DropdownData;
};

const RecursiveDropdown: FC<RecursiveDropdownProps> = ({ dictionary }) => {
  return (
    <div className='text-gray-700 w-full'>
      <Dropdown data={dictionary} />
    </div>
  );
};

export default RecursiveDropdown;
