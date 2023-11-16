"use client";

import { useState } from "react";

import { DndContext } from "@dnd-kit/core";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import debounce from "lodash/debounce";

import { Draggable } from "./Draggable";
import { Droppable } from "./Droppable";
import useSearchStore from "../../store/searchSlice";
import { CourseType } from "../../types";
import Course from "../dashboard/components/Course";

const Search = () => {
  const [query, setQuery] = useState("");
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

  const debouncedSearch = debounce(async (searchQuery) => {
    if (!searchQuery) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/search/?course=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.courses);
        if (data.courses.length > 0) {
          addRecentSearch(searchQuery);
          // Add your searchCache.set logic here
        }
      } else {
        setError(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setError("There was an error fetching courses.");
      console.error("There was an error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Update the query state and trigger the debounced search function
  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    debouncedSearch(query);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && query.trim().length > 0) {
      debouncedSearch(query);
    }
  };

  const handleRecentSearchClick = (search) => {
    // Display dummy popup for now
    alert(`Displaying course information for: ${search}`);
    // In the future, you might open a modal or a dedicated component to show the course profile
  };

  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Search courses
      </label>
      <div className="relative mt-2 rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          className="block w-full py-1.5 pl-10 pr-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
          placeholder="Search courses"
          autoComplete="off"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {/* Recent Searches */}
      <div className="mt-3">
        <div className="text-xs font-semibold text-gray-500">
          Recent searches:
        </div>
        <div className="flex overflow-x-auto py-2 space-x-2">
          {/* Consider changing this to For block */}
          {recentSearches.map((search, index) => (
            <button
              key={index} // Preferably use a more unique key if possible
              style={{
                animation: `cascadeFadeIn 500ms ease-out forwards ${
                  index * 150
                }ms`,
              }}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-0.5 px-2 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              onClick={() => handleRecentSearchClick(search)}
            >
              {search}
            </button>
          ))}
        </div>
      </div>
      <div className="relative max-h-[400px] overflow-y-auto">
        {loading ? (
          // Center the loading spinner in the middle of the search box
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-ring loading-lg text-gray-700"></span>
          </div>
        ) : searchResults.length > 0 ? (
          // Render the list of search results
          <ul className="divide-y divide-dashed hover:divide-solid">
            {searchResults.map((course) => (
              <li key={course.catalog_number}>
                <Course id={course.catalog_number} course={course} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No courses found.
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [courseParents, setCourseParents] = useState({}); // Track which container each course is in
  const { searchResults } = useSearchStore();

  // Function to handle drag end event
  function handleDragEnd(event) {
    const { active, over } = event;
    if (over) {
      setCourseParents((prev) => ({
        ...prev,
        [active.id]: over.id,
      }));
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Search />
      {/* Drag from search results */}
      <div
        style={{ border: "1px solid #ccc", padding: "10px", marginTop: "20px" }}
      >
        {searchResults.map((course) => (
          <Draggable
            key={course.catalog_number.toString()}
            id={course.catalog_number.toString()}
          >
            {(dragging) => (
              <div style={{ opacity: dragging ? 0.5 : 1 }}>
                <Course id={course.catalog_number} course={course} />
              </div>
            )}
          </Draggable>
        ))}
      </div>

      {/* Droppable containers */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "20px",
        }}
      >
        {Object.keys(courseParents).map((containerId) => (
          <Droppable key={containerId} id={containerId}>
            {(active, over) => (
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  backgroundColor: over ? "lightblue" : "white",
                }}
              >
                {Object.entries(courseParents).map(([courseId, parentId]) => {
                  if (parentId === containerId) {
                    return (
                      <Draggable key={courseId} id={courseId}>
                        {(dragging) => (
                          <div style={{ opacity: dragging ? 0.5 : 1 }}>
                            {/* Render the course */}
                            <Course id={courseId} course="balls" />
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DndContext>
  );
}

export default App;
