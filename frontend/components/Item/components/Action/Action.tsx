import { forwardRef, CSSProperties, MouseEvent } from 'react';

import classNames from 'classnames';

import styles from './Action.module.scss';

export type ActionProps = React.HTMLAttributes<HTMLButtonElement> & {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties['cursor'];
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ active, className, cursor, style, onClick, ...props }, ref) => {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        {...props}
        className={classNames(styles.Action, className)}
        tabIndex={0}
        style={
          {
            ...style,
            cursor,
            '--fill': active?.fill,
            '--background': active?.background,
          } as CSSProperties
        }
        onClick={handleClick}
      />
    );
  }
);

Action.displayName = 'Action';
