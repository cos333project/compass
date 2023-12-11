import { FC } from 'react';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

interface Dictionary {
  [key: string]: any;
}

interface DropdownProps {
  data: Dictionary;
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
const Dropdown: FC<DropdownProps> = ({ data }) => {
  const renderContent = (data: Dictionary) => {
    return Object.entries(data).map(([key, value]) => {
      if (key === 'satisfied') {
        return null;
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
            style={{ backgroundColor: '#f6f6f6' }} // subtle background color
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
}

const RecursiveDropdown: FC<RecursiveDropdownProps> = ({ dictionary }) => {
  return <Dropdown data={dictionary} />;
};

export default RecursiveDropdown;
