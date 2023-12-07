import React, { useState, useEffect } from 'react';
import styles from './InfoComponent.module.scss';
import { createPortal } from 'react-dom';

interface InfoComponentProps {
  dept: string;
  coursenum: string;
}

const portalNode = document.createElement('div');
portalNode.id = 'info-popup-portal';
document.body.appendChild(portalNode);

const InfoComponent: React.FC<InfoComponentProps> = ({ dept, coursenum }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [courseDetails, setCourseDetails] = useState<{ [key: string]: any } | null>(null);
  let hoverTimer;

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
        console.log('course details', data);
        setCourseDetails(data);
      })
      .catch((error) => console.error('Error:', error));
    }

    return () => {
      clearTimeout(hoverTimer);
    };
  }, [showPopup, dept, coursenum]);

  const handleMouseEnter = () => {
    hoverTimer = setTimeout(() => {
      setShowPopup(true);
    }, 1000); // 1000 milliseconds = 1 second
  };

  //const handleMouseLeave = () => {
  //  clearTimeout(hoverTimer);
  //  setShowPopup(false);
  //};

  return (
    <>
      <div style={{ position: 'relative' }}>
        <div
          className={styles.infoCircle}
          onMouseEnter={handleMouseEnter}
        >
          i
        </div>
      </div>
      {showPopup &&
        createPortal(
          <>
            <div className={styles.modalBackdrop} onClick={() => setShowPopup(false)}></div>
            <div className={styles.modal}>
              {courseDetails ? (
                <div>
                  {Object.entries(courseDetails).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                </div>
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </>,
          portalNode
        )}
    </>
  );
};

export default InfoComponent;




