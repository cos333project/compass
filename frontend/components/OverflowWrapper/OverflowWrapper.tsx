import styles from './OverflowWrapper.module.scss';

type OverflowWraperProps = {
  children: React.ReactNode;
};

export function OverflowWrapper({ children }: OverflowWraperProps) {
  return <div className={styles.OverflowWrapper}>{children}</div>;
}
