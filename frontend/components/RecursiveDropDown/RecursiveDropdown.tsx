import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Button as JoyButton } from '@mui/joy';

import classNames from 'classnames';
import styles from '../InfoComponent/InfoComponent.module.scss'

interface Dictionary {
  [key: string]: any;
}

interface DropdownProps {
  data: Dictionary;
  csrfToken: string;
  checkRequirements: any;
}

interface SatisfactionStatusProps {
  satisfied: string;
  count: number;
  minNeeded: number;
}

// Satisfaction status icon with styling
const SatisfactionStatus: FC<SatisfactionStatusProps> = ({ satisfied, count, minNeeded }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {satisfied === 'True' ? (
        <CheckCircleOutlineIcon style={{ color: 'green', marginLeft: '10px' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 450, color: 'red' }}>
            {count}/{minNeeded}
          </span>
          <HighlightOffIcon style={{ color: 'red', marginLeft: '10px' }} />
        </div>
      )}
    </div>
  </>
);

// Dropdown component with refined styling
const Dropdown: FC<DropdownProps> = ({ data, csrfToken, checkRequirements }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [explanation, setExplanation] = useState<{ [key: number]: any } | null>(null);

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (modalContent && (event.key === 'Escape' || event.key === 'Enter')) {
      event.stopPropagation();
      handleClose(event);
    }
  });

  const handleExplanationClick = (e, reqId) => {
    const url = new URL(`${process.env.BACKEND}/requirement_info/`);
    url.searchParams.append('reqId', reqId);

    fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setExplanation(data);
        console.log(data);
      })
      .catch((error) => console.error('Requirement Info Error:', error));
    e.stopPropagation();
    setShowPopup(true);
  };

  const handleClose = (e) => {
    setExplanation('');
    e.stopPropagation();
    setShowPopup(false);
  };

  const modalContent = showPopup ? (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.detailRow}>
          {explanation ? (
            Object.entries(explanation).map(([index, value]) => {
              if (index === '0') {
                if (value) {
                  return(<div>
                    <strong className={styles.strong}>{'Explanation'}:</strong> {value}
                    </div>)
                }
                else {
                  return(<div>
                    <strong className={styles.strong}>{'Explanation'}:</strong> {'No explanation available'}
                    </div>)
                }
              }
              else if (value[0]) {
                return(<div>
                  <strong className={styles.strong}>{'Satisfying Courses'}: </strong>
                  {value.map((course) => {return `${course}, `}).join('').slice(0, -2)}
                  </div>)
              }
            })
          ) : (
            <div>Loading...</div>
          )}
        </div>
        <footer className='mt-auto text-right'>
          <JoyButton variant='outlined' color='neutral' onClick={handleClose} sx={{ ml: 2 }} size='sm'>
            Close
          </JoyButton>
        </footer>
      </div>
    </div>
  ) : null;

  const handleClick = (courseId, reqId) => {
    console.log('courseId', courseId);
    console.log('reqId', reqId);
    fetch(`${process.env.BACKEND}/manually_settle/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ courseId: courseId, reqId: reqId }),
    })
      .then((response) => response.json())
      .then((data) => console.log('Manual Settle Success', data))
      .catch((error) => console.error('Manual Settle Error:', error));

    checkRequirements();
  };

  const renderContent = (data: Dictionary) => {
    return Object.entries(data).map(([key, value]) => {
      if (key === 'req_id' || key === 'satisfied' || key === 'count' || key === 'min_needed') {
        return null;
      }
      const isArray = Array.isArray(value);
      if (isArray) {
        if (key === 'settled') {
          // Render as disabled buttons
          return value[0].map((item, index) => (
            <Button
              key={index}
              variant='contained'
              disabled={!item['manually_settled']}
              style={{
                margin: '5px',
                backgroundColor: '#f7f7f7',
                color: '#000',
              }}
              onClick={() => handleClick(item['id'], value[1])}
            >
              {item['code']}
            </Button>
          ));
        } else if (key === 'unsettled') {
          // Render as normal buttons
          return value[0].map((item, index) => (
            <Button
              key={index}
              variant='contained'
              style={{
                margin: '5px',
                backgroundColor: '#f7f7f7',
                color: '#000',
                opacity: 0.5,
              }}
              onClick={() => handleClick(item['id'], value[1])}
            >
              {item['code']}
            </Button>
          ));
        }
      }
      const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
      const satisfactionElement =
        isObject && 'satisfied' in value ? (
          <SatisfactionStatus
            satisfied={value.satisfied}
            count={value.count}
            minNeeded={value.min_needed}
          />
        ) : null;

      const subItems = isObject ? { ...value, satisfied: undefined } : value;
      const hasNestedItems = isObject && Object.keys(subItems).length > 0;

      // Style adjustments for accordion components
      return (
        <Accordion
          key={key}
          style={{ margin: '0', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}
        >
          <AccordionSummary
            expandIcon={hasNestedItems ? <ExpandMoreIcon /> : null}
            aria-controls={`${key}-content`}
            id={`${key}-header`}
            style={{ backgroundColor: '#f6f6f6' }} // subtle background color
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div className={classNames(styles.Action)} onClick={(e) => handleExplanationClick(e, data[key]['req_id'])}>
                <Typography style={{ fontWeight: 500 }}>{key}</Typography>
              </div>
              {satisfactionElement}
            </div>
          </AccordionSummary>
          <AccordionDetails>
            {hasNestedItems ? renderContent(subItems) : <Typography>{value}</Typography>}
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  return <>
          {renderContent(data)}
          {modalContent && createPortal(modalContent, document.body)}
        </>;
};

// Recursive dropdown component
interface RecursiveDropdownProps {
  dictionary: Dictionary;
  csrfToken: string;
  checkRequirements: any;
}

const RecursiveDropdown: FC<RecursiveDropdownProps> = ({
  dictionary,
  csrfToken,
  checkRequirements,
}) => {
  return <Dropdown data={dictionary} csrfToken={csrfToken} checkRequirements={checkRequirements} />;
};

export default RecursiveDropdown;
