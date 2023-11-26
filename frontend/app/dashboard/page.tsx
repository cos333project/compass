"use client";

import { useEffect, useState } from "react";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import { RecursiveDropdown } from '../../components/RecursiveDropDown';
import useAuthStore from '../../store/authSlice';
import UserState from '../../store/userSlice';
import { Canvas } from './Canvas';

type Dictionary = {
  [key: string]: any;
};

const nestedDictionary: Dictionary = {
  key1: "value1",
  key2: {
    subkey1: "subvalue1",
    subkey2: {
      subsubkey1: "subsubvalue1"
    }
  }
};

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const {
    user,
    isAuthenticated,
    checkAuthentication
  } = useAuthStore((state) => state);
  const userProfile = UserState((state) => state.profile);
  useEffect(() => {
    checkAuthentication()
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error("Auth error:", error);
        setIsLoading(false);
      });
  }, [checkAuthentication]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = `${process.env.BACKEND}/login`;
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen pt-20 p-2 rounded-xl">
        <main className='flex p-2 flex-grow bg-[#FAFAFA] rounded-xl shadow-xl'>
          <div className='flex flex-grow'> {/* Flex container for both components */}
            {/* Canvas Component */}
            {!isLoading && userProfile && userProfile.netId !== "" ? (
              <Canvas
                user={userProfile}
                trashable
                columns={2}
                strategy={rectSortingStrategy}
                wrapperStyle={() => ({
                  width: 150,
                  height: 150
                })}
              />
            ) : (
              <div>Loading...</div> // You can replace this with a proper loading component or message
            )}
            {/* RecursiveDropdown Component */}
            <div className='w-1/4'> {/* Adjust width as necessary */}
              <RecursiveDropdown dictionary={nestedDictionary} />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
