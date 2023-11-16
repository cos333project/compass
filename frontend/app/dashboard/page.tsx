'use client';

import { useEffect, useState } from 'react';

import { rectSortingStrategy } from '@dnd-kit/sortable';

import { Canvas } from './Canvas';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import Search from '../../components/Search';
import useAuthStore from '../../store/authSlice';
import { useAcademicPlannerStore } from '../../store/dndSlice';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, checkAuthentication } = useAuthStore((state) => state);

  useEffect(() => {
    checkAuthentication()
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error('Auth error:', error);
        setIsLoading(false);
      });
  }, [checkAuthentication]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = 'http://localhost:8000/login';
    }
  }, [isAuthenticated, isLoading]);

  // const handleDragEnd = (event: DragEndEvent) => {
  //   // Logic for handling drag end event (update Zustand store)
  //   // ...
  // };

  return (
    <>
      <Navbar />
      <div className='flex flex-col h-screen pt-20 p-2 rounded-xl'>
        <main className='flex p-2 flex-grow bg-[#FAFAFA] rounded-xl shadow-xl'>
          <div className='min-w-max w-3/12 bg-white p-2 mr-0 rounded-xl shadow-xl transform transition-all hover:shadow-2xl'>
            <Search />
          </div>
          {user && (
            <Canvas
              user={user}
              trashable
              columns={2}
              strategy={rectSortingStrategy}
              wrapperStyle={() => ({
                width: 150,
                height: 150,
              })}
            />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
