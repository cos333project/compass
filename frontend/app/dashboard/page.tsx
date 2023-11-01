'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Search from '../../components/Search';
import { useAuth } from '../utils/Auth';
import { AuthProvider } from '../utils/Auth';

const Dashboard = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  return (
    <>
        <Navbar/>
        <div className="flex flex-col h-screen pt-20 p-8 bg-[#0F1E2F]">
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
        </div>
        <Footer />
    </>
  );
}

export default Dashboard;
