import { useEffect, FC } from 'react';

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

const SatisfactionStatus: FC<SatisfactionStatusProps> = ({ satisfied }) => (
  <>
    {satisfied === 'True' ? (
      <CheckCircleOutlineIcon style={{ color: 'green', marginLeft: '10px' }} />
    ) : (
      <HighlightOffIcon style={{ color: 'red', marginLeft: '10px' }} />
    )}
  </>
);

const Dropdown: FC<DropdownProps> = ({ data }) => {
  const renderContent = (data: Dictionary) => {
    return Object.entries(data).map(([key, value]) => {
      if (key === 'satisfied') {
        // Skip rendering 'satisfied' as a standalone entry
        return null;
      }

      const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
      const satisfactionElement =
        isObject && 'satisfied' in value ? (
          <SatisfactionStatus satisfied={value.satisfied} />
        ) : null;

      const subItems = isObject ? { ...value, satisfied: undefined } : value;
      const hasNestedItems = isObject && Object.keys(subItems).length > 0;

      return (
        <Accordion
          key={key}
          style={{ margin: '0', boxShadow: 'none', borderBottom: '1px solid #ccc' }}
        >
          <AccordionSummary
            expandIcon={hasNestedItems ? <ExpandMoreIcon /> : null}
            aria-controls={`${key}-content`}
            id={`${key}-header`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography>{key}</Typography>
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

interface RecursiveDropdownProps {
  dictionary: Dictionary;
}

const RecursiveDropdown: FC<RecursiveDropdownProps> = ({ dictionary }) => {
  return <Dropdown data={dictionary} />;
};

export default RecursiveDropdown;
