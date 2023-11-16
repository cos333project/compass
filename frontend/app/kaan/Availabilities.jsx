import {
  useAssignedAnyCount,
  useAssignedIdCount,
  useIsAssigned
} from "./AssignmentsContext";
import { HeadDraggable, HeadPlaceholder } from "./Head";
import styles from "./Availabilities.module.css";

import { heads, months, people } from "./fixtures";

import { useCallback, useMemo, useState } from "react";
import { TableLayout } from "./TableLayout";
import { useDroppable } from "@dnd-kit/core";

function Availability({ id }) {
  const isAssigned = useIsAssigned();

  const idIsAssigend = isAssigned(id);

  return <>{idIsAssigend ? <HeadPlaceholder /> : <HeadDraggable id={id} />}</>;
}

export function Availabilities() {
  const { setNodeRef } = useDroppable({
    id: "remove-assignment"
  });
  const [filter, setFilter] = useState("");

  const lowerFilter = useMemo(() => filter.toLowerCase(), [filter]);

  const handleFilter = useCallback((e) => {
    setFilter(e.target.value);
  }, []);
  const peopleFilter = useCallback(
    (person) => {
      return !lowerFilter || person.toLowerCase().search(lowerFilter) >= 0;
    },
    [lowerFilter]
  );

  const countIds = useAssignedIdCount();
  const anyCount = countIds("any-");

  return (
    <TableLayout
      ref={setNodeRef}
      head={
        <label>
          {"Filter People: "}
          <input type="search" value={filter} onChange={handleFilter} />
        </label>
      }
    >
      <table>
        <colgroup>
          <col width="160px" />
          <col width="200px" span={months.length} />
        </colgroup>
        <thead>
          <tr>
            <th />
            {months.map((month) => (
              <th key={month}>{month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.filter(peopleFilter).map((person) => (
            <tr key={person}>
              <td>
                <div className={styles.label}>
                  {person}{" "}
                  <HeadDraggable
                    id={`any-${person}-${anyCount}`}
                    isTransparent
                  />
                </div>
              </td>
              {months.map((month) => {
                const headCount = countIds(`${month}-${person}-`);

                return (
                  <td key={month}>
                    <div
                      className={styles.heads}
                      style={{
                        /* eslint-disable-next-line */
                        ["--availability-bg"]:
                          headCount < 4
                            ? // gradient from 200 40 40 to 180 180 255
                              `${200 - (20 / 4) * headCount} ${
                                40 + (140 / 4) * headCount
                              } ${40 + (215 / 4) * headCount}`
                            : undefined
                      }}
                    >
                      {heads.map((head) => (
                        <Availability
                          key={head}
                          id={`${month}-${person}-${head}`}
                        />
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </TableLayout>
  );
}
