import { ToggleSwitchProps } from '../types';

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange }) => {
  return (
    <label className='flex items-center cursor-pointer'>
      <div className='relative'>
        <input
          type='checkbox'
          className='sr-only'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className='block bg-gray-300 w-14 h-8 rounded-full'></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
            checked ? 'transform translate-x-full' : ''
          }`}
        ></div>
      </div>
      <div className='ml-3 text-sm font-medium'>{label}</div>
    </label>
  );
};

export default ToggleSwitch;
