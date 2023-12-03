import { useState, FormEvent, ChangeEvent } from 'react';

type FormData = {
  firstName: string;
  lastName: string;
  classYear: string;
  major: string;
  minors: string[];
};

type SettingsFormProps = {
  closeSettings: () => void;
};

const SettingsForm: React.FC<SettingsFormProps> = ({ closeSettings }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    classYear: '',
    major: '',
    minors: [],
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleMinorsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prevData) => ({ ...prevData, minors: values }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    closeSettings();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <form className='bg-white p-5 rounded-lg flex flex-col gap-2.5' onSubmit={handleSubmit}>
        {/* Labels and inputs for firstName, lastName, classYear... */}
        <label htmlFor='major' className='sr-only'>
          Major
        </label>
        <select
          id='major'
          name='major'
          className='p-2.5 rounded-lg border border-gray-200'
          value={formData.major}
          onChange={handleInputChange}
        >
          {/* Options... */}
        </select>
        <label htmlFor='minors' className='sr-only'>
          Minors
        </label>
        <select
          id='minors'
          name='minors'
          className='p-2.5 rounded-lg border border-gray-200'
          multiple={true}
          value={formData.minors}
          onChange={handleMinorsChange}
        >
          {/* Options... */}
        </select>
        {/* Submit and Cancel buttons... */}
      </form>
    </div>
  );
};

export default SettingsForm;
