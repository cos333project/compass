import { useState, useEffect } from 'react';

import { Button } from '@mui/joy';
import classNames from 'classnames';
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

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (modalContent && (event.key === 'Escape')) {
      handleClose(event);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setShowPopup(true);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setShowPopup(false);
  };

  const modalContent = showPopup ? (
    <div className={styles.modalBackdrop} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal}>
        {courseDetails ? (
          <div>
            <div className={styles.detailRow}>
              <strong className={styles.strong}>{`${dept} ${coursenum}`}</strong>
            </div>
            {Object.entries(courseDetails).map(([key, value]) => (
              <div key={key} className={styles.detailRow}>
                <strong className={styles.strong}>{key}:</strong> {value}
              </div>
            ))}
          </div>
        ) : (
          <div>Loading...</div>
        )}
        <footer className='mt-auto text-right'>
          <Button variant='outlined' color='neutral' onClick={handleClose} sx={{ ml: 2 }} size='sm'>
            Close
          </Button>
        </footer>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div
        onClick={handleClick}
        style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
        className={classNames(styles.Action)}
      >
        {`${dept} ${coursenum}`}
      </div>
      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
};

export default InfoComponent;
