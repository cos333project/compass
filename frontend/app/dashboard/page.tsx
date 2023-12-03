'use client';

import { useEffect, useState } from 'react';

import { rectSortingStrategy } from '@dnd-kit/sortable';

import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../store/authSlice';
import UserState from '../../store/userSlice';

import { Canvas } from './Canvas';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { checkAuthentication } = useAuthStore((state) => state);
  const userProfile = UserState((state) => state.profile);
  useEffect(() => {
    checkAuthentication()
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error('Auth error:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <div className='flex flex-col h-screen pt-24 rounded-xl'>
        <main className='flex flex-grow bg-[#FAFAFA] rounded-xl shadow-xl'>
          {!isLoading && userProfile && userProfile.netId !== '' ? (
            <Canvas
              user={userProfile}
              trashable
              columns={2}
              strategy={rectSortingStrategy}
              wrapperStyle={() => ({
                width: 150,
                height: 150,
              })}
            />
          ) : (
            <div>Loading...</div> // You can replace this with a proper loading component or message
          )}
        </main>
      </div>
      <div className='py-12 sm:py-16 lg:pb-20' />
      <Footer />
    </>
  );
};

export default Dashboard;
