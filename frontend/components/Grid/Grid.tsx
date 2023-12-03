import styles from './Grid.module.scss';

export type GridProps = {
  size: number;
  step?: number;
  onSizeChange(size: number): void;
};

export function Grid({ size }: GridProps) {
  return (
    <div
      className={styles.Grid}
      style={
        {
          '--grid-size': `${size}px`,
        } as React.CSSProperties
      }
    />
  );
}
