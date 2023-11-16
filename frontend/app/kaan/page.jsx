'use client';

import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  rectIntersection,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

import { useCallback, useEffect, useState } from "react";
import { AssignmentsContext } from "./AssignmentsContext";
import { Availabilities } from "./Availabilities";
import { Head } from "./Head";
import { Projects } from "./Projects";
import { Spinner, SpinnerOverlay } from "./Spinner";
import "./styles.css";
// import { persistenceProvider, ydoc } from "./yjs-doc";

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const [assignmentsMap, setAssignmentsMapState] = useState({});
  // const [isReady, setIsReady] = useState(!persistenceProvider);

  const setAssignmentsMap = useCallback(
    (fn) => {
      const result = fn(assignmentsMap);

      // const map = ydoc.getMap("assignments");

      for (const [key, value] of Object.entries(result)) {
        map.set(key, value);
      }

      for (const key of map.keys()) {
        if (!result[key]) {
          map.delete(key);
        }
      }

      setAssignmentsMapState(result);
    },
    [assignmentsMap]
  );

  useEffect(() => {
    function handleUpdate(changes) {
      // const map = ydoc.getMap("assignments");

      setAssignmentsMapState(Object.fromEntries(map));
    }

    function handleSynced() {
      setIsReady(true);
    }

    // ydoc.on("update", handleUpdate);

    // persistenceProvider?.on("synced", handleSynced);

    return () => {
      // ydoc.off("update", handleUpdate);

      // persistenceProvider?.off("synced", handleSynced);
    };
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  return (
    <AssignmentsContext.Provider value={assignmentsMap}>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        measuring={{
          dragOverlay: {
            strategy: MeasuringStrategy.Always
          },
          draggable: {
            strategy: MeasuringStrategy.Always
          },
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
        collisionDetection={rectIntersection}
        autoScroll={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* {!isReady && (
          <SpinnerOverlay>
            <Spinner />
          </SpinnerOverlay>
        )} */}


          <Projects />
          <Availabilities />
    


        <DragOverlay>
          {activeId ? (
            <Head id={activeId} isTransparent={activeId.startsWith("any")} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </AssignmentsContext.Provider>
  );

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function removeAssignment(id) {
    setAssignmentsMap((current) => {
      const copy = { ...current };

      delete copy[id];

      return copy;
    });
  }

  function handleDragEnd(event) {
    setActiveId(null);

    const { active, over, collisions } = event;

    const containsCollisionWithRemoveDroppable = collisions.some(
      (collision) => collision.id === "remove-assignment"
    );

    if (over) {
      if (containsCollisionWithRemoveDroppable) {
        removeAssignment(active.id);
      } else if (
        over.data.current.accepts.includes(active.data.current.type) ||
        active.data.current.isTransparent
      ) {
        setAssignmentsMap((current) => ({
          ...current,
          [active.id]: over.id
        }));

        const droppableNode =
          collisions[0]?.data?.droppableContainer?.node?.current;

        if (droppableNode) {
          if (droppableNode.classList.contains("dropped")) {
            droppableNode.classList.remove("dropped");
            // Triggers Browser Restyle to restart keyframe animation
            // FIXME: this is bad.
            droppableNode.getBoundingClientRect();
          }
          droppableNode.classList.add("dropped");
        }
      }
    } else {
      if (assignmentsMap[active.id]) {
        removeAssignment(active.id);
      }
    }
  }
}
