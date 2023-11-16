import React from "react";
import { useDroppable } from "@dnd-kit/core";
import styles from "./ProjectMonth.module.css";
import { useAssignedHeads } from "./AssignmentsContext";
import { HeadDraggable } from "./Head";

export function ProjectMonth(props) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: props.id,
    data: {
      accepts: [props.id.split("-")[0]]
    }
  });
  const isDroppable = active?.data?.current?.type.startsWith(
    props.id.split("-")[0]
  );
  const style = {
    "--dnd-status-color":
      isOver && (isDroppable || active?.id.startsWith("any-"))
        ? "10 180 40"
        : isDroppable || active?.id.startsWith("any-")
        ? "50 50 200"
        : isOver && !isDroppable
        ? "200 40 40"
        : !!active
        ? "220 220 255"
        : undefined
  };

  const assignedHeads = useAssignedHeads(props.id);

  return (
    <div ref={setNodeRef} style={style} className={styles.wrapper}>
      {assignedHeads.map((headId) => (
        <HeadDraggable
          key={headId}
          id={headId}
          isTransparent={headId.startsWith("any-")}
        />
      ))}
    </div>
  );
}
