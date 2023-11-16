import styles from "./Spinner.module.css";

export function Spinner() {
  return <span className={styles.spinner}></span>;
}

export function SpinnerOverlay({ children }) {
  return <div className={styles.overlay}>{children}</div>;
}
