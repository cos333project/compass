'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  CancelDrop,
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  Modifiers,
  // TODO: Should probably delete this: useDroppable,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  KeyboardCoordinateGetter,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  AnimateLayoutChanges,
  SortableContext,
  useSortable,
  arrayMove,
  defaultAnimateLayoutChanges,
  verticalListSortingStrategy,
  SortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal, unstable_batchedUpdates } from 'react-dom';

import { Course, Profile } from '@/types';

import Search from '@/components/Search';
import { TabbedMenu } from '@/components/TabbedMenu';
import useSearchStore from '@/store/searchSlice';

import { Item, Container, ContainerProps } from '../../components';

import { coordinateGetter as multipleContainersCoordinateGetter } from './multipleContainersKeyboardCoordinates';

async function fetchCsrfToken() {
  try {
    const response = await fetch(`${process.env.BACKEND}/csrf`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.csrfToken ? String(data.csrfToken) : '';
  } catch (error) {
    return 'Error fetching CSRF token!';
  }
}
let csrfToken: string;

if (typeof window === 'undefined') {
  // Server-side or during prerendering/build time
  csrfToken = '';
} else {
  // Client-side
  (async () => {
    csrfToken = await fetchCsrfToken();
  })();
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}) {
  const { active, isDragging, over, setNodeRef, transition, transform } = useSortable({
    id,
    data: {
      type: 'container',
      children: items,
    },
    animateLayoutChanges,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') || items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}

const dropAnimation: DropAnimation = {
  // TODO: Lowkey, this is where we can render the course card differently -> full title to DEPT CATNUM
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

type Props = {
  user: Profile;
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  initialItems?: Items; // Consider removing since we populate semester bins based on classyear
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;

  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;

  wrapperStyle?(args: { index: number }): React.CSSProperties;

  itemCount?: number;
  items?: Items;
  handle?: boolean;
  onRemove?(courseId: string): void;
  renderItem?(): React.ReactElement;

  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
};

export const PLACEHOLDER_ID = 'placeholder';
export const SEARCH_RESULTS_ID = 'Search Results';
const defaultClassYear = new Date().getFullYear() + 1;

export function Canvas({
  user,
  adjustScale = false,
  // itemCount = 3, // remove this?
  cancelDrop,
  columns = 2,
  handle = true,
  // initialItems, // remove
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  // vertical = false,
  scrollable,
}: Props) {
  const classYear = user.classYear;

  const generateSemesters = (classYear: number): Items => {
    const semesters: Items = {};
    const startYear = classYear - 4;

    for (let year = startYear; year < classYear; ++year) {
      semesters[`Fall ${year}`] = [];
      semesters[`Spring ${year + 1}`] = [];
    }
    return semesters;
  };

  const updateSemesters = (
    prevItems: Items,
    classYear: number,
    userCourses: { [key: number]: Course[] }
  ): Items => {
    const startYear = classYear - 4;
    console.log('updateSemesters called');

    let semester = 1;
    for (let year = startYear; year < classYear; ++year) {
      prevItems[`Fall ${year}`] = userCourses[semester].map(
        (course) => `${course.department_code} ${course.catalog_number}`
      );
      semester += 1;
      prevItems[`Spring ${year + 1}`] = userCourses[semester].map(
        (course) => `${course.department_code} ${course.catalog_number}`
      );
      semester += 1;
    }

    console.log(userCourses);
    console.log(prevItems);
    return prevItems;
  };

  const semesters = generateSemesters(classYear);
  const [items, setItems] = useState<Items>(() => ({
    [SEARCH_RESULTS_ID]: [], // Initialize search container with no courses
    ...semesters,
  }));

  type Dictionary = {
    [key: string]: any; // TODO: Aim to replace 'any' with more specific types.
  };

  // Initialize a more structured dictionary if possible
  const initialRequirements: Dictionary = {};

  // State for academic requirements
  const [academicPlan, setAcademicPlan] = useState<Dictionary>(initialRequirements);
  const [refreshAcademicPlan, setRefreshedAcademicPlan] = useState(0);

  // Logs for debugging
  console.log('Initial academic plan:', academicPlan);

  // Assuming 'user' is of type User
  const userMajorCode = user.major?.code;
  const userMinors = user.minors ?? [];

  // Log user's major and minors
  console.log('User Major:', userMajorCode, 'User Minors:', userMinors);

  // Structure to hold degree requirements
  const degreeRequirements: Dictionary = { General: '' };
  console.log('Initial degree requirements:', degreeRequirements);

  // Add major to degree requirements if it's a string
  if (userMajorCode && typeof userMajorCode === 'string') {
    degreeRequirements[userMajorCode] = academicPlan[userMajorCode] ?? {};
    console.log(`Added major ${userMajorCode} to degree requirements:`, degreeRequirements);
  }

  // Iterate over minors and add them to degree requirements if their code is a string
  userMinors.forEach((minor) => {
    const minorCode = minor.code;
    if (minorCode && typeof minorCode === 'string') {
      degreeRequirements[minorCode] = academicPlan[minorCode] ?? {};
      console.log(`Added minor ${minorCode} to degree requirements:`, degreeRequirements);
    }
  });

  const fetchCourses = () => {
    fetch(`${process.env.BACKEND}/fetch_courses/`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched userCourses:', data);
        setItems((prevItems) => ({
          ...updateSemesters(prevItems, classYear, data),
        }));
      })
      .catch((error) => {
        console.error('User Courses Error:', error);
      });
  };

  const checkRequirements = () => {
    console.log('ALERT!!! RECHECKING REQUIREMENTS!!!');
    fetch(`${process.env.BACKEND}/check_requirements/`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched academic requirements data:', data);
        setAcademicPlan(data);
        setRefreshedAcademicPlan(Date.now()); // Triggering a re-render by updating the number
      })
      .catch((error) => {
        console.error('Requirements Check Error:', error);
      });
  };

  // Fetch user courses and check requirements on initial render
  useEffect(() => {
    fetchCourses();
    checkRequirements();
  }, []);

  const { searchResults } = useSearchStore();
  // TODO: Clean this up or remove if not needed
  // useEffect(() => {
  //   setItems((prevItems) => ({
  //     ...prevItems,
  //     // for deptcode catalognum in each semesterbin:
  //     // exclude if shared with search results bin
  //     [SEARCH_RESULTS_ID]: searchResults.map(
  //       (course) => `${course.department_code} ${course.catalog_number}`
  //     )
  //   }));
  // }, [searchResults]);

  useEffect(() => {
    setItems((prevItems) => {
      const userCurrentCourses: Set<string> = new Set<string>();
      Object.keys(prevItems).forEach((key) => {
        if (key !== SEARCH_RESULTS_ID) {
          const courses = prevItems[key];
          courses.forEach((course) => {
            userCurrentCourses.add(course.toString());
          });
        }
      });

      return {
        ...prevItems,
        [SEARCH_RESULTS_ID]: searchResults
          .filter(
            (course) =>
              !userCurrentCourses.has(`${course.department_code} ${course.catalog_number}`)
          )
          .map((course) => `${course.department_code} ${course.catalog_number}`),
      };
    });
  }, [searchResults]);

  // TODO: Clean this up or remove if not needed
  // useEffect(() => {
  //   const updatedSemesters = generateSemesters(classYear);
  //   setContainers([SEARCH_RESULTS_ID, ...Object.keys(updatedSemesters)]);
  // }, [classYear]);

  const initialContainers = [SEARCH_RESULTS_ID, ...Object.keys(semesters)];
  const [containers, setContainers] = useState<UniqueIdentifier[]>(initialContainers);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId !== null) {
        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => container.id !== overId && containerItems.includes(container.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );
  const findContainer = (id?: UniqueIdentifier) => {
    if (id === null || id === undefined) {
      return;
    }
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: UniqueIdentifier) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  const onDragCancel = () => {
    console.log('Drag canceled');
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={({ active }) => {
          console.log('Drag started: ', active.id);
          setActiveId(active.id);
          setClonedItems(items);
        }}
        onDragOver={({ active, over }) => {
          console.log('Drag over: ', {
            activeId: active.id,
            overId: over?.id,
          });
          const overId = over?.id;
          if (overId === null || overId === undefined || active.id in items) {
            return;
          }

          const overContainer = findContainer(overId);
          const activeContainer = findContainer(active.id);

          if (!overContainer || !activeContainer) {
            return;
          }

          if (activeContainer !== overContainer) {
            setItems((items) => {
              const activeItems = items[activeContainer];
              const overItems = items[overContainer];
              const overIndex = overItems.indexOf(overId);
              const activeIndex = activeItems.indexOf(active.id);

              let newIndex: number;

              if (overId in items) {
                newIndex = overItems.length + 1;
              } else {
                const isBelowOverItem =
                  over &&
                  active.rect.current.translated &&
                  active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;

                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
              }

              recentlyMovedToNewContainer.current = true;

              return {
                ...items,
                [activeContainer]: items[activeContainer].filter((item) => item !== active.id),
                [overContainer]: [
                  ...items[overContainer].slice(0, newIndex),
                  items[activeContainer][activeIndex],
                  ...items[overContainer].slice(newIndex, items[overContainer].length),
                ],
              };
            });
          }
        }}
        onDragEnd={async ({ active, over }) => {
          console.log('Drag end: ', {
            activeId: active.id,
            overId: over?.id,
          });
          if (active.id in items && over?.id) {
            setContainers((containers) => {
              const activeIndex = containers.indexOf(active.id);
              const overIndex = containers.indexOf(over.id);

              return arrayMove(containers, activeIndex, overIndex);
            });
          }

          const activeContainer = findContainer(active.id);

          if (!activeContainer) {
            setActiveId(null);
            return;
          }

          const overId = over?.id;

          if (overId === null || overId === undefined) {
            setActiveId(null);
            return;
          }

          if (overId === PLACEHOLDER_ID) {
            const newContainerId = getNextContainerId();

            unstable_batchedUpdates(() => {
              setContainers((containers) => [...containers, newContainerId]);
              setItems((items) => ({
                ...items,
                [activeContainer]: items[activeContainer].filter((id) => id !== activeId),
                [newContainerId]: [active.id],
              }));
              setActiveId(null);
            });
            return;
          }

          const courseId = active.id;
          const semesterId = activeContainer;
          const csrfToken = await fetchCsrfToken();
          // This also should only be updated if the user drops the course into a new semester
          fetch(`${process.env.BACKEND}/update_courses/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ courseId: courseId, semesterId: semesterId }),
          })
            .then((response) => response.json())
            .then((data) => console.log('Update success', data))
            .catch((error) => console.error('Update Error:', error));

          const overContainer = findContainer(overId);

          if (overContainer) {
            const activeIndex = items[activeContainer].indexOf(active.id);
            const overIndex = items[overContainer].indexOf(overId);

            if (activeIndex !== overIndex) {
              setItems((items) => ({
                ...items,
                [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
              }));
              checkRequirements();
            }
          }

          setActiveId(null);

          // TODO: Clean this up or remove if not needed
          // fetch(`${process.env.BACKEND}/check_requirements`, {
          //   method: 'GET',
          //   credentials: 'include',
          // })
          //   .then((response) => response.json())
          //   .then((data) => {
          //     console.log('updated data', data);
          //     setAcademicPlan(data);
          //   })
          //   .catch((error) => console.error('Requirements Check Error:', error));
        }}
        cancelDrop={cancelDrop}
        onDragCancel={onDragCancel}
        modifiers={modifiers}
      >
        <SortableContext items={[...containers, PLACEHOLDER_ID]}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {/* Left Section for Search Results */}
            {containers.includes('Search Results') && (
              <div style={{ width: '380px' }}>
                {' '}
                {/* issue here with resizing + with requirements dropdowns*/}
                {/* Try to get this to fixed height*/}
                <DroppableContainer
                  key='Search Results'
                  id='Search Results'
                  label={<Search />}
                  columns={columns}
                  items={items['Search Results']}
                  scrollable={scrollable}
                  style={containerStyle}
                  height='703px'
                >
                  <SortableContext items={items['Search Results']} strategy={strategy}>
                    {items['Search Results'].map((value, index) => (
                      <SortableItem
                        disabled={isSortingContainer}
                        key={index}
                        id={value}
                        index={index}
                        handle={handle}
                        style={getItemStyles}
                        wrapperStyle={wrapperStyle}
                        renderItem={renderItem} // This render function should render with full name
                        containerId='Search Results'
                        getIndex={getIndex}
                      />
                    ))}
                  </SortableContext>
                </DroppableContainer>
              </div>
            )}

            {/* Center Section for other containers in a 2x4 grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr 1fr 1fr',
              }}
            >
              {containers
                .filter((id) => id !== 'Search Results')
                .map((containerId) => (
                  <DroppableContainer
                    key={containerId}
                    id={containerId}
                    label={minimal ? undefined : `${containerId}`}
                    columns={columns}
                    items={items[containerId]}
                    scrollable={scrollable}
                    style={containerStyle}
                    unstyled={minimal}
                    height='160px'
                  >
                    <SortableContext items={items[containerId]} strategy={strategy}>
                      {items[containerId].map((course, index) => (
                        <SortableItem
                          disabled={isSortingContainer}
                          key={index}
                          id={course}
                          index={index}
                          handle={handle}
                          style={getItemStyles}
                          wrapperStyle={wrapperStyle}
                          onRemove={() => handleRemove(course, containerId)}
                          renderItem={renderItem} // TODO: This render should be bite-sized (dept + catnum)
                          containerId={containerId}
                          getIndex={getIndex}
                        />
                      ))}
                    </SortableContext>
                  </DroppableContainer>
                ))}
            </div>

            {/* Right section for requirements */}
            <div style={{ width: '380px' }}>
              <TabbedMenu tabsData={academicPlan} refresh={refreshAcademicPlan} />
            </div>
          </div>
        </SortableContext>

        {createPortal(
          <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
            {activeId ? renderSortableItemDragOverlay(activeId) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </>
  );

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    return (
      <Item
        value={id}
        handle={handle}
        style={getItemStyles({
          containerId: findContainer(id) as UniqueIdentifier,
          overIndex: -1,
          index: getIndex(id),
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        color={getColor(id)}
        wrapperStyle={wrapperStyle({ index: 0 })}
        renderItem={renderItem}
        dragOverlay
      />
    );
  }

  function handleRemove(value: UniqueIdentifier, containerId: UniqueIdentifier) {
    setItems((items) => {
      const updatedCourses = {
        ...items,
        [containerId]: items[containerId].filter((course) => course !== value.toString()),
      };
      return updatedCourses;
    });

    fetch(`${process.env.BACKEND}/update_courses/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ courseId: value.toString(), semesterId: 'Search Results' }),
    })
      .then((response) => response.json())
      .then((data) => console.log('Button clicked!', data))
      .catch((error) => console.error('Update Error:', error));
  }

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }
}

function getColor(id: UniqueIdentifier) {
  switch (String(id)[0]) {
    case 'A':
      return '#7193f1';
    case 'B':
      return '#ffda6c';
    case 'C':
      return '#00bcd4';
    case 'D':
      return '#ef769f';
  }

  return undefined;
}

type SortableItemProps = {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  disabled?: boolean;

  style(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay?: boolean;
  }): React.CSSProperties;

  getIndex(id: UniqueIdentifier): number;

  onRemove?(): void;

  renderItem?(): React.ReactElement;

  wrapperStyle({ index }: { index: number }): React.CSSProperties;
};

function SortableItem({
  disabled,
  id,
  index,
  handle,
  onRemove,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? setActivatorNodeRef : undefined}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
      onRemove={onRemove}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
