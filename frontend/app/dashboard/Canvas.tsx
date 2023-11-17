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
  useDroppable,
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import debounce from 'lodash/debounce';
import { createPortal, unstable_batchedUpdates } from 'react-dom';

import { Item, Container, ContainerProps, Draggable } from '../../components';
// import Course from './components/Course';
import { coordinateGetter as multipleContainersCoordinateGetter } from './multipleContainersKeyboardCoordinates';
import { createRange, generateSemesters } from '../utilities';
import useSearchStore from '@/store/searchSlice';

type User = {
  major: string;
  classYear: number;
};

type Course = {
  id: number;
  guid: number;
  department_code: string;
  catalog_number: number;
  title: string;
  originSemesterId?: string;
};

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

// SEARCH START //
const Search: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set());
  const {
    setSearchResults,
    searchResults,
    addRecentSearch,
    recentSearches,
    setError,
    loading,
    setLoading,
  } = useSearchStore((state) => ({
    setSearchResults: state.setSearchResults,
    searchResults: state.searchResults,
    addRecentSearch: state.addRecentSearch,
    recentSearches: state.recentSearches,
    setError: state.setError,
    loading: state.loading,
    setLoading: state.setLoading,
  }));

  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/search/?course=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data: { courses: Course[] } = await response.json();
        setSearchResults(data.courses);
        if (data.courses.length > 0) {
          addRecentSearch(searchQuery);
          // Add your searchCache.set logic here
        }
      } else {
        setError(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setError('There was an error fetching courses.');
      console.error('There was an error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Update the query state and trigger the debounced search function
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    debouncedSearch(query);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && query.trim().length > 0) {
      debouncedSearch(query);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    // Display dummy popup for now
    alert(`Displaying course information for: ${search}`);
    // In the future, you might open a modal or a dedicated component to show the course profile
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, course: Course) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(course));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div>
      <label htmlFor='search' className='sr-only'>
        Search courses
      </label>
      <div className='relative mt-2 rounded-lg shadow-sm'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
        </div>
        <input
          type='text'
          name='search'
          id='search'
          className='block w-full py-1.5 pl-10 pr-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm'
          placeholder='Search courses'
          autoComplete='off'
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {/* Recent Searches */}
      <div className='mt-3'>
        <div className='text-xs font-semibold text-gray-500'>Recent searches:</div>
        <div className='flex overflow-x-auto py-2 space-x-2'>
          {/* Consider changing this to For block */}
          {recentSearches.map((search, index) => (
            <button
              key={index} // Preferably use a more unique key if possible
              style={{
                animation: `cascadeFadeIn 500ms ease-out forwards ${index * 150}ms`,
              }}
              className='bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-0.5 px-2 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300'
              onClick={() => handleRecentSearchClick(search)}
            >
              {search}
            </button>
          ))}
        </div>
      </div>
      <div className='relative max-h-[400px] overflow-y-auto'>
        {loading ? (
          // Center the loading spinner in the middle of the search box
          <div className='flex justify-center items-center h-full'>
            <span className='loading loading-ring loading-lg text-gray-700'></span>
          </div>
        ) : searchResults.length > 0 ? (
          // Render the list of search results
          <ul className='divide-y divide-dashed hover:divide-solid'>
            {searchResults.map((course) => (
              <li key={course.catalog_number}>
                {/* <Course id={course.catalog_number} course={course} /> */}
                Balls
              </li>
            ))}
          </ul>
        ) : (
          <div className='text-center py-4 text-gray-500'>No courses found.</div>
        )}
      </div>
    </div>
  );
};

// SEARCH END //

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
  const { active, attributes, isDragging, listeners, over, setNodeRef, transition, transform } =
    useSortable({
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
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

interface Props {
  user: User;
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  initialItems?: Items;
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
  renderItem?: any;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
}

export const TRASH_ID = 'void';
export const PLACEHOLDER_ID = 'placeholder';
export const SEARCH_RESULTS_ID = 'search-results'; // Corrected the constant name

const empty: UniqueIdentifier[] = [];

export function Canvas({
  user,
  adjustScale = false,
  itemCount = 3,
  cancelDrop,
  columns,
  handle = false,
  initialItems,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
}: Props) {
  const classYear = 2025 ?? user.classYear;
  const generateSemesters = (classYear: number, itemCount: number): Items => {
    let semesters: Items = {};
    const startYear = classYear - 1;

  for (let year = startYear; year < classYear; ++year) {
    semesters[`Fall ${year}`] = [];
    semesters[`Spring ${year + 1}`] = [];
  }

  return semesters;
  };

  const initial = initialItems || generateSemesters(classYear, itemCount); // Adjusted to use prop or default
  const { searchResults } = useSearchStore(); // Assuming useSearchStore is imported

  const [items, setItems] = useState<Items>(() => ({
    [SEARCH_RESULTS_ID]: [], // Initialize search container with no courses
    ...initial,
  }));

  useEffect(() => {
    setItems((prevItems) => ({
      ...prevItems,
      [SEARCH_RESULTS_ID]: searchResults.map((course, index) => `${course.department_code} ${course.catalog_number}`),
    }));
  }, [searchResults]);

  const initialContainers = [SEARCH_RESULTS_ID, ...Object.keys(initial)];
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

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections;
        }

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
  const findContainer = (id: UniqueIdentifier) => {
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
        console.log('Drag over: ', { activeId: active.id, overId: over?.id });
        const overId = over?.id;

        if (overId == null || overId === TRASH_ID || active.id in items) {
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
      onDragEnd={({ active, over }) => {
        console.log('Drag end: ', { activeId: active.id, overId: over?.id });
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

        if (overId == null) {
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

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = items[activeContainer].indexOf(active.id);
          const overIndex = items[overContainer].indexOf(overId);

          if (activeIndex !== overIndex) {
            setItems((items) => ({
              ...items,
              [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
            }));
          }
        }

        setActiveId(null);
      }}
      cancelDrop={cancelDrop}
      onDragCancel={onDragCancel}
      modifiers={modifiers}
    >
      <div
        style={{
          display: 'inline-grid',
          boxSizing: 'border-box',
          padding: 20,
          gridAutoFlow: vertical ? 'row' : 'column',
        }}
      >
        <SortableContext items={[...containers, PLACEHOLDER_ID]}>
          {containers.map((containerId) => {
            // Conditional rendering for the SEARCH_RESULTS_ID container
            // if (containerId === SEARCH_RESULTS_ID && items[SEARCH_RESULTS_ID].length > 0) {
            //   return (
            //     <DroppableContainer
            //       key={SEARCH_RESULTS_ID}
            //       id={SEARCH_RESULTS_ID}
            //       label={'Search Results'}
            //       items={items[SEARCH_RESULTS_ID]}
            //       scrollable={scrollable}
            //       style={containerStyle}
            //       unstyled={minimal}
            //       // ... other props if needed ...
            //     >
            //       <SortableContext
            //         items={searchResults.map((_, index) => `course-${index}`)}
            //         strategy={strategy}
            //       >
            //         {searchResults.map((course, index) => {
            //           const courseId = `course-${index}`;
            //           return (
            //             <SortableItem
            //               key={courseId}
            //               id={courseId}
            //               index={index}
            //               handle={handle}
            //               style={getItemStyles}
            //               wrapperStyle={wrapperStyle}
            //               renderItem={() => (
            //                 <div className='w-full p-5 rounded-lg hover:bg-gray-200 hover:shadow-md transition duration-300 ease-in-out cursor-pointer'>
            //                   <div className='flex mb-3 rounded'>
            //                     <h4 className='text-xs font-semibold text-black'>
            //                       {course.department_code} {course.catalog_number}
            //                     </h4>
            //                   </div>
            //                   <div className='text-sm text-gray-900'>{course.title}</div>
            //                 </div>
            //               )}
            //               containerId={SEARCH_RESULTS_ID}
            //               getIndex={getIndex}
            //             />
            //           );
            //         })}
            //       </SortableContext>
            //     </DroppableContainer>
            //   );
            // }

            // Rendering other containers
            return (
              <DroppableContainer
                key={containerId}
                id={containerId}
                label={minimal ? undefined : `${containerId}`}
                columns={columns}
                items={items[containerId]}
                scrollable={scrollable}
                style={containerStyle}
                unstyled={minimal}
                onRemove={() => handleRemove(containerId)}
              >
                <SortableContext items={items[containerId]} strategy={strategy}>
                  {items[containerId].map((value, index) => (
                    <SortableItem
                      disabled={isSortingContainer}
                      key={value}
                      id={value}
                      index={index}
                      handle={handle}
                      style={getItemStyles}
                      wrapperStyle={wrapperStyle}
                      renderItem={renderItem}
                      containerId={containerId}
                      getIndex={getIndex}
                    />
                  ))}
                </SortableContext>
              </DroppableContainer>
            );
          })}
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeId
            ? containers.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
      {trashable && activeId && !containers.includes(activeId) ? <Trash id={TRASH_ID} /> : null}
    </DndContext>
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

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    return (
      <Container
        label={`Overlay ${containerId}`}
        columns={columns}
        style={{
          height: '100%',
        }}
        shadow
        unstyled={false}
      >
        {items[containerId].map((item, index) => (
          <Item
            key={item}
            value={item}
            handle={handle}
            style={getItemStyles({
              containerId,
              overIndex: -1,
              index: getIndex(item),
              value: item,
              isDragging: false,
              isSorting: false,
              isDragOverlay: false,
            })}
            color={getColor(item)}
            wrapperStyle={wrapperStyle({ index })}
            renderItem={renderItem}
          />
        ))}
      </Container>
    );
  }

  function handleRemove(containerID: UniqueIdentifier) {
    setContainers((containers) => containers.filter((id) => id !== containerID));
  }

  function handleAddColumn() {
    const newContainerId = getNextContainerId();

    unstable_batchedUpdates(() => {
      setContainers((containers) => [...containers, newContainerId]);
      setItems((items) => ({
        ...items,
        [newContainerId]: [],
      }));
    });
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

function Trash({ id }: { id: UniqueIdentifier }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        left: '50%',
        marginLeft: -150,
        bottom: 20,
        width: 300,
        height: 60,
        borderRadius: 5,
        border: '1px solid',
        borderColor: isOver ? 'red' : '#DDD',
      }}
    >
      Drop here to delete
    </div>
  );
}

interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: UniqueIdentifier): number;
  renderItem(): React.ReactElement;
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
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
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
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
