'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Search from '../../components/Search';
import DragDropContext from '../../components/DragDropContext';
import useSearchStore from '../../store/searchSlice';
import useAuthStore from '../../store/authSlice';
import { Course } from '../../types';
import DropdownMenu from '@/components/DropdownMenu';

const Dashboard = () => {
  const router = useRouter();
  const { preloadCourses, allCourses } = useSearchStore(state => ({
    preloadCourses: state.preloadCourses,
    allCourses: state.allCourses
  }));

  const { isAuthenticated, checkAuthentication } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    checkAuthentication: state.checkAuthentication,
  }));

  useEffect(() => {
    checkAuthentication().catch((error) => {
      console.error("Couldn't fetch auth state:", error);
    });
  }, [checkAuthentication]);

  // Then, listen for changes to isAuthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to CAS login page
      router.push('http://localhost:8000/cas/login');
    }
  }, [isAuthenticated, router]);

  // Use the preloaded courses as the initial state if available
  const initialCourses = allCourses.length > 0 ? allCourses : [
    // Your hardcoded initial courses can be used as a fallback or for testing
    { id: '1', department_code: 'COS', catalog_number: 126, title: "Introduction to Computer Science" },
    { id: '2', department_code: 'COS', catalog_number: 521, title: "Advanced Algorithm Design" },
    { id: '3', department_code: 'COS', catalog_number: 333, title: "Advanced Programming Techniques" }
  ];

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen pt-20 p-8 rounded">
        <main className="flex p-5 flex-grow bg-[#FAFAFA] rounded shadow-lg">
          {/* Search Section (Left) */}
          <div className="w-3/12 bg-white p-8 mr-8 rounded shadow">
            <select aria-label="Upload transcript" className="w-full mb-4 p-2 rounded text-gray-700">
              <option>Upload transcript</option>
            </select>
            <Search />
          </div>

          {/* Carousel for Courses (Middle) */}
          <div className="flex-grow bg-white p-5 rounded shadow">
            <div className="flex justify-center items-center mb-5">
              <button className="bg-black text-white py-2 px-3 mr-5 transition duration-300 ease-in-out transform hover:scale-105">Schedule</button>
              <button className="bg-black text-white py-2 px-3 transition duration-300 ease-in-out transform hover:scale-105">Requirements</button>
            </div>
            <DragDropContext initialCourses={initialCourses} />
          </div>
          <DropdownMenu />
        </main> 

       {/* Planning Hub (Bottom Half) */}
<div className="flex flex-col md:flex-row p-5 mt-6 bg-gray-100 rounded-xl shadow-xl">
  {/* Planning Hub Information (Left) */}
  <div className="md:w-3/12 bg-white p-8 mb-6 md:mb-0 md:mr-8 rounded-xl shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-2xl">
    <h2 className="text-2xl font-extrabold text-gray-700 mb-6">First Last</h2>
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-3">Major</h3>
      <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-lg shadow-sm">Computer Science</div>
    </div>
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-3">Minors</h3>
      <div className="space-y-2">
        <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-lg shadow-sm">Applied Mathematics</div>
        <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-lg shadow-sm">Cognitive Science</div>
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-3">Minors Near Completion</h3>
      <div className="space-y-2">
        <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-lg shadow-sm">Applied Mathematics (1 course away)</div>
        <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-lg shadow-sm">Statistics (2 courses away)</div>
      </div>
    </div>
  </div>

  {/* Planning Hub Carousel (Middle) */}
  <div className="flex-grow bg-white p-5 rounded-xl shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-2xl">
    {/* Placeholder for planning hub content */}
    <div className="flex justify-center items-center h-full">
      <p className="text-gray-700 text-center text-lg font-medium">Visualize your academic journey here. Plan semesters, track progress, and explore new learning paths with ease.</p>
    </div>
  </div>
</div>

<Footer />
</div>
</>
);
}
export default Dashboard;
