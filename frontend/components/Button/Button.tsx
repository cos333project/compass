import { HTMLAttributes, FC } from 'react';

import classNames from 'classnames';

import styles from './Button.module.scss';

export type Props = HTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const Button: FC<Props> = ({ children, ...props }) => {
  return (
    <button className={classNames(styles.Button)} {...props}>
      {children}
    </button>
  );
};
