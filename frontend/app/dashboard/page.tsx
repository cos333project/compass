'use client';

import { useEffect, useState, FC } from 'react';

import { rectSortingStrategy } from '@dnd-kit/sortable';

import Footer from '../../components/Footer';
// import LoadingComponent from '../../components/LoadingComponent';
import Navbar from '../../components/Navbar';
// import SkeletonApp from '../../components/SkeletonApp';
import useAuthStore from '../../store/authSlice';
import UserState from '../../store/userSlice';

import { Canvas } from './Canvas';

const Dashboard: FC = () => {
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
      <div className='flex flex-col min-h-screen pt-24 rounded-xl'>
        <main className='flex flex-grow bg-[#FAFAFA] shadow-xl'>
            <Canvas
              user={userProfile}
              columns={2}
              strategy={rectSortingStrategy}
              wrapperStyle={() => ({
                width: 150,
                height: 150,
              })}
            />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
