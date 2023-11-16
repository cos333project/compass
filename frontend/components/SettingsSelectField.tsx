import React from 'react';
import { SelectFieldProps } from '../types';

const SelectField: React.FC<SelectFieldProps> = ({ label, options, value, onChange, multiple }) => {
  const selectId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
      onChange(selectedOptions);
    } else {
      onChange(event.target.value);
    }
  };

  return (
    <div className='flex flex-col'>
      <label htmlFor={selectId} className='mb-2 font-bold'>
        {label}
      </label>
      <select
        id={selectId}
        className='p-2 border border-gray-300 rounded'
        value={value}
        onChange={handleChange}
        multiple={multiple}
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
