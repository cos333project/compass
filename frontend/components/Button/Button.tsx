import classNames from 'classnames';
import { HTMLAttributes } from 'react';

import styles from './Button.module.scss';

export interface Props extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<Props> = ({ children, ...props }) => {
  return (
    <button className={classNames(styles.Button)} {...props}>
      {children}
    </button>
  );
};
