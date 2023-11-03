'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Search from '../../components/Search';
import DragDropContext from '../../components/DragDropContext';

const Dashboard = () => {
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; username: string | null }>({ isAuthenticated: false, username: null });
  const [initialCourses, setInitialCourses] = useState([
    {id: 1, name: 'lol', department_code: 'COS', catalog_number: 100, title: "hello"},
    {id: 2, name: 'okc', department_code: 'COS', catalog_number: 521, title: "hello"},
    {id: 3, name: 'idk', department_code: 'COS', catalog_number: 333, title: "hello"}
  ]);
  return (
    <>
        {/* <Navbar auth={auth} /> */}
        <Navbar />
        <div className="flex flex-col h-screen pt-20 p-8 rounded">
            <main className="flex p-5 flex-grow bg-[#FAFAFA] rounded">
                {/* Search Section (Left) */}
                <div className="w-4/12 bg-[#FAFAFA] p-8 mr-8 rounded">
                    <select aria-label="Upload transcript" className="w-full mb-2  p-2 rounded text-[#FAFAFA]">
                      <option>Upload transcript</option>
                    </select>
                    <Search />
                </div>
                
                {/* Orange Bar */}
                <div className="bg-[#D87B2D] w-1 h-[90%] my-auto"></div>

                {/* Carousel for Courses (Middle) */}
                <div className="w-6/12 bg-[#FAFAFA] p-5 mr-5 rounded">
                  <div className="flex justify-center items-center mb-5">
                    <button className="bg-black text-white py-2 px-3 mr-5">Schedule</button>
                    <button className="bg-black text-white py-2 px-3 mr-5">Requirements</button>
                  </div>
                  <div>
                    {/* Carousel goes here */}
                    <DragDropContext initialCourses={initialCourses} /> 
                  </div>
                </div>
                {/* Orange Bar */}
                <div className="bg-[#D87B2D] w-1 h-[80%] my-auto"></div>

                {/* Information Section (Right) */}
                <div className="w-3/12 p-5 rounded">
                    <div className="flex mb-5 rounded">
                      <h3 className="mb-4 text-[#0F1E2F] rounded">Potential Certificates/Minors</h3>
                    </div>
                    <div>
                        <h3 className="mb-4  text-[#0F1E2F] rounded">SML</h3>
                        <h3 className="mb-4  text-[#0F1E2F] rounded">MQE</h3>
                        <h3 className="mb-4  text-[#0F1E2F] rounded">PACM</h3>
                    </div>
                </div>
            </main> 
          <Footer />
        </div>
    </>
  );
}

export default Dashboard;
