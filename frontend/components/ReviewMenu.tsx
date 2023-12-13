import React, { useState, useEffect } from 'react';

interface ReviewMenuProps {
  dept: string;
  coursenum: string;
}

const ReviewMenu: React.FC<ReviewMenuProps> = ({ dept, coursenum }) => {
  const [reviews, setReviews] = useState<string[]>([]);

  useEffect(() => {
    if (dept && coursenum) {
      const url = new URL(`${process.env.BACKEND}/course_comments/`);
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
        if (data && data.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch((error) => console.error('Error:', error));
    }
  }, [dept, coursenum]);


  return (
<div style={{ width: '600px', margin: '0 auto', border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}>
  <strong style={{ fontSize: '20px', color: '#333', marginBottom: '10px', display: 'block' }}>Course Reviews</strong>
  <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
    {reviews.map((review, index) => (
      <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <div style={{ fontSize: '16px', color: '#555' }}>{review}</div>
      </div>
    ))}
  </div>
</div>

  );
};

export default ReviewMenu;

