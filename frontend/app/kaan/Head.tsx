import React, { forwardRef, memo, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import styles from "./Head.module.css";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";

const currentlyDraggedStyle = { filter: "grayscale(0.8)", opacity: 0.4 };

export const HeadDraggable = memo(({ id, isTransparent, isWithinOverlay }) => {
  const [type, person] = useMemo(() => id.split("-"), [id]);
  const { attributes, active, listeners, setNodeRef, transform } = useDraggable(
    {
      id: id,
      data: {
        type,
        isTransparent
      }
    }
  );

  const style = useMemo(
    () =>
      transform
        ? active?.id !== id
          ? {
              transform: CSS.Translate.toString(transform)
            }
          : currentlyDraggedStyle
        : undefined,
    [transform, active, id]
  );

  return (
    <Head
      id={id}
      className={classNames(styles.head, isTransparent && styles.transparent)}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    />
  );

  return (
    <div
      className={classNames(styles.head, isTransparent && styles.transparent)}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <button className={styles.button} type="button">
        {person.substr(0, 2)}
      </button>
    </div>
  );
});

export const Head = memo(
  forwardRef(({ id, isTransparent, className, ...props }, ref) => {
    const [, person] = useMemo(() => id.split("-"), [id]);

    return (
      <div ref={ref} className={classNames(styles.head, className)} {...props}>
        <button className={styles.button} type="button">
          {person.substr(0, 2)}
        </button>
      </div>
    );
  })
);

export function HeadPlaceholder() {
  return <div className={styles.button + " " + styles.placeholder}></div>;
}
