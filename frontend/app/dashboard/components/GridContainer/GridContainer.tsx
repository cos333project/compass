import styles from './GridContainer.module.scss';

export interface GridContainerProps {
  children: React.ReactNode;
  columns: number;
}

export function GridContainer({children, columns}: GridContainerProps) {
  return (
    <ul
      className={styles.GridContainer}
      style={
        {
          '--col-count': columns,
        } as React.CSSProperties
      }
    >
      {children}
    </ul>
  );
}
