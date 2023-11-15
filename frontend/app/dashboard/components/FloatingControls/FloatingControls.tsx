import classNames from 'classnames';

import styles from './FloatingControls.module.scss';

export interface FloatingControlsProps {
  children: React.ReactNode;
}

export function FloatingControls({children}: FloatingControlsProps) {
  return <div className={classNames(styles.FloatingControls)}>{children}</div>;
}
