import { forwardRef } from "react";
import styles from "./TableLayout.module.css";

export const TableLayout = forwardRef(({ head, children }, ref) => {
  return (
    <div ref={ref} className={styles.wrapper}>
      {!!head && <div className={styles.head}>{head}</div>}

        <div className={styles.scrollarea}>{children}</div>

    </div>
  );
});
