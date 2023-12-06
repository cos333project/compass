import React, { useState, useEffect } from 'react';
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
        console.log('course details', data);
        setCourseDetails(data);
      })
      .catch((error) => console.error('Error:', error));
    }
  }, [showPopup, dept, coursenum]);

  return (
    <div style={{ position: 'relative' }}>
      <div 
        className={styles.infoCircle} 
        onMouseEnter={() => setShowPopup(true)} 
        onMouseLeave={() => setShowPopup(false)}
      >
        i
      </div>
      {showPopup && (
        <div className={styles.infoPopup}>
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
      )}
    </div>
  );
};

export default InfoComponent;
