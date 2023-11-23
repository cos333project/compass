import React, { useState, Fragment, FormEvent, ChangeEvent } from 'react';
import { Transition } from '@headlessui/react';

interface FormData {
  firstName: string;
  lastName: string;
  classYear: string;
  major: string;
  minors: string[];
}

interface SettingsFormProps {
  closeSettings: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ closeSettings }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    classYear: '',
    major: '',
    minors: [],
  });

  const [isFormVisible, setIsFormVisible] = useState(true);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsFormVisible(false);
    // Delay closing to allow for transition
    setTimeout(() => closeSettings(), 200); // Adjusted duration for fade-out effect
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setTimeout(() => closeSettings(), 200); // Adjusted duration for fade-out effect
  };

  return (
    <Transition
      as={Fragment}
      show={isFormVisible}
      enter='transition ease-out duration-1000'
      enterFrom='transform opacity-0 scale-95'
      enterTo='transform opacity-100 scale-100'
      leave='transition ease-out duration-1000'
      leaveFrom='transform opacity-100 scale-100'
      leaveTo='transform opacity-0 scale-95'
    >
      <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
        <form className='bg-white p-5 rounded-lg flex flex-col gap-2.5' onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="firstName" 
            placeholder="First Name" 
            value={formData.firstName}
            onChange={handleInputChange}
            className='p-2.5 rounded-lg border border-gray-200'
          />
          <input 
            type="text" 
            name="lastName" 
            placeholder="Last Name" 
            value={formData.lastName}
            onChange={handleInputChange}
            className='p-2.5 rounded-lg border border-gray-200'
          />
          {/* Additional input fields */}
          <button type="submit" className='p-2.5 rounded-lg border border-gray-200'>Save</button>
          <button type="button" onClick={handleCancel} className='p-2.5 rounded-lg border border-gray-200'>Cancel</button>
        </form>
      </div>
    </Transition>
  );
};

export default SettingsForm;
