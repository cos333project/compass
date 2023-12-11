import { useState, useEffect } from 'react';

import { createPortal } from 'react-dom';

import styles from './InfoComponent.module.scss';

interface InfoComponentProps {
  dept: string;
  coursenum: string;
}

const InfoComponent: React.FC<InfoComponentProps> = ({ dept, coursenum }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [courseDetails, setCourseDetails] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    if (showPopup && dept && coursenum) {
      const url = new URL(`${process.env.BACKEND}/course_details/`);
      url.searchParams.append('dept', dept);
      url.searchParams.append('coursenum', coursenum);

      fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setCourseDetails(data);
        })
        .catch((error) => console.error('Error:', error));
    }
  }, [showPopup, dept, coursenum]);

  const handleClick = () => {
    setShowPopup(true);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setShowPopup(false);
  };

  const modalContent = showPopup ? (
    <div className={styles.modalBackdrop} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={handleClose}>
          X
        </button>
        {courseDetails ? (
          <div>
            {Object.entries(courseDetails).map(([key, value]) => (
              <div key={key} className={styles.detailRow}>
                <strong className={styles.strong}>{key}:</strong> {value}
              </div>
            ))}
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div
        onClick={handleClick}
        style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
      >x
        {/* <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-6 h-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
          />
        </svg> */}
      </div>
      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
};

export default InfoComponent;
