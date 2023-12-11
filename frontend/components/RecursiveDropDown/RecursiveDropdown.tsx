import { FC } from 'react';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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
}

// Satisfaction status icon with styling
const SatisfactionStatus: FC<SatisfactionStatusProps> = ({ satisfied }) => (
  <>
    {satisfied === 'True' ? (
      <CheckCircleOutlineIcon style={{ color: 'green', marginLeft: '10px' }} />
    ) : (
      <HighlightOffIcon style={{ color: 'red', marginLeft: '10px' }} />
    )}
  </>
);

// Dropdown component with refined styling
const Dropdown: FC<DropdownProps> = ({ data, csrfToken, checkRequirements }) => {
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
      if (key === 'satisfied') {
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
              disabled
              style={{
                margin: '5px',
                backgroundColor: '#f7f7f7',
                color: '#000',
              }}
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
          <SatisfactionStatus satisfied={value.satisfied} />
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
            style={{ backgroundColor: '#f7f7f7' }} // subtle background color
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography style={{ fontWeight: 500 }}>{key}</Typography>
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

  return <>{renderContent(data)}</>;
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
