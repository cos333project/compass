import { FC } from 'react';

import { createPortal } from 'react-dom';

import { SettingsModalProps } from '../types';

const Modal: FC<SettingsModalProps> = ({ children, onClose }) => {
  return createPortal(
    <>
      {/* TODO: Need an equivalent fade out animation when 'Close' is pressed */}
      <div className='modal-backdrop fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 z-50'></div>
      <div className='modal-entrance fixed inset-0 flex justify-center items-center z-50'>
        <div className='p-5 rounded-lg max-w-md w-1/2 shadow-xl'>
          {children}
          <div className='mt-5 text-right'>
            <button className='bg-purple-500 text-white rounded px-4 py-2' onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default Modal;
