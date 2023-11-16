import { useCallback, useMemo, useState } from "react";

import { months, projects } from "./fixtures";
import { ProjectMonth } from "./ProjectMonth";

import { TableLayout } from "./TableLayout";

export function Projects() {
  const [filter, setFilter] = useState("");
  const lowerFilter = useMemo(() => filter.toLowerCase(), [filter]);
  const projectFilter = useCallback(
    (project) => {
      return !lowerFilter || project.toLowerCase().search(lowerFilter) >= 0;
    },
    [lowerFilter]
  );
  const handleFilter = useCallback((event) => {
    setFilter(event.target.value);
  }, []);

  return (
    <TableLayout
      head={
        <label>
          {"Filter Projects: "}
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
          {projects.filter(projectFilter).map((project) => (
            <tr key={project}>
              <td>{project}</td>
              {months.map((month) => (
                <td key={month}>
                  <ProjectMonth id={`${month}-${project}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableLayout>
  );
}
