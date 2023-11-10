'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Search from '../../components/Search';
import Canvas from '../../components/Canvas';
import useSearchStore from '../../store/searchSlice';
import useAuthStore from '../../store/authSlice';
// import DndContextProvider from '../../components/DndContextProvider';
import { DndContext } from '@dnd-kit/core';

console.log("Dashboard component rendering");

const Dashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, checkAuthentication } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    checkAuthentication: state.checkAuthentication,
  }));

  useEffect(() => {
    console.log("Dashboard effect for checking authentication");
    checkAuthentication().then(() => {
      setIsLoading(false);
    }).catch((error) => {
      console.error("Couldn't fetch auth state:", error);
      setIsLoading(false);
    });
  }, [checkAuthentication]);

  useEffect(() => {
    if (!isLoading) {
      console.log("Dashboard effect for redirect on isAuthenticated change", isAuthenticated);
      if (!isAuthenticated) {
        console.log("Redirecting to login because user is not authenticated");
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen pt-20 p-2 rounded-xl">
        <main className="flex p-2 flex-grow bg-[#FAFAFA] rounded-xl shadow-xl">
          {/* Search Section (Left) */}
          <DndContext>
            <div className="w-3/12 bg-white p-2 mr-0 rounded-xl shadow-xl transform transition-all hover:-translate-y-1 hover:shadow-xll">
              <Search />
            </div>
            <Canvas />

            {/*
            <div className="flex-grow p-5 rounded">
              <div className="flex justify-center items-center mb-5">
                <button className="bg-black text-white py-2 px-3 mr-5 transition duration-300 ease-in-out transform hover:scale-105">Schedule</button>
                <button className="bg-black text-white py-2 px-3 transition duration-300 ease-in-out transform hover:scale-105">Requirements</button>
              </div> 
            </div> */}

            {/* Planning Hub Information (Right) */}
            <div className="md:w-3/12 bg-white p-8 mb-6 md:mb-0 md:mr-2 rounded-xl shadow-xl transform transition-all hover:-translate-y-1 hover:shadow-xll">
              <h2 className="text-2xl font-extrabold text-gray-700 mb-6">First Last</h2>
              <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Major</h3>
              <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-xl shadow-xl">Computer Science</div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Minors</h3>
                <div className="space-y-2">
                  <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-xl shadow-xl">Applied Mathematics</div>
                  <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-xl shadow-xl">Cognitive Science</div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Minors Near Completion</h3>
                <div className="space-y-2">
                  <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-xl shadow-xl">Applied Mathematics (1 course away)</div>
                  <div className="text-gray-700 font-medium bg-gray-50 p-3 rounded-xl shadow-xl">Statistics (2 courses away)</div>
                </div>
              </div>
            </div>

          </DndContext>
        </main> 

       {/* Planning Hub (Bottom Half) */}
       <div className="flex flex-col md:flex-row p-5 mt-6 bg-gray-100 rounded-xl shadow-xl">
          <div className="flex-grow bg-white p-5 rounded-xl shadow-xl transform transition-all hover:-translate-y-1 hover:shadow-xl">
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
};

export default Dashboard;
