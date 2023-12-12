'use client';

import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
const teamMembers = [
    { name: 'A' },
    { name: 'B' },
    { name: 'C' },
    { name: 'D' },
    { name: 'E' },
  ];
const About = () => {

  return (
    <>
      <Navbar />
      <div>
        <div className='relative isolate pt-14'>
          {/* Background Gradient Effect */}
          <div className='absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80' aria-hidden='true'>
            <div
              className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
  
          {/* Introduction to the Compass Project */}
          <div className='py-24 sm:py-32 lg:pb-40'>
            <div className='mx-auto max-w-7xl px-6 lg:px-8'>
              <div className='mx-auto max-w-2xl text-center text-[var(--system-text-color)]'>
                <h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>Welcome to Compass.</h1>
                <p className='mt-6 text-lg leading-8'>
                  Compass is a platform designed to plan courses and manage schedules, helping you guide through your academic journey at Princeton as a Compass.
                </p>
                {/* Additional content or call-to-action buttons */}
              </div>
            </div>
          </div>
  
          {/* Team Members Section */}
          <div className='bg-gray-100 py-24 sm:py-32 lg:pb-40'>
            <div className='mx-auto max-w-7xl px-6 lg:px-8'>
                <div className='text-center'>
                <h2 className='text-3xl font-bold sm:text-4xl'>Meet the Team</h2>
                <p className='mt-3 max-w-2xl mx-auto text-xl'>
                    A dedicated group of individuals behind the Compass project.
                </p>
                </div>
                <div className='mt-12 grid grid-cols-3 gap-8 justify-items-center lg:justify-items-stretch'>
                {teamMembers.slice(0, 3).map((member) => (
                    <div key={member.name} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className='h-40 bg-gray-200 rounded-lg'></div> {/* Placeholder for image */}
                    <h3 className='mt-6 text-xl font-semibold'>{member.name}</h3>
                    </div>
                ))}
                {/* Adjust this flex container to position D and E with equal width */}
                <div className='col-span-3 flex justify-center gap-8'>
                    {teamMembers.slice(3).map((member) => (
                    <div key={member.name} className="flex-grow bg-white p-6 rounded-lg shadow-sm">
                        <div className='h-40 bg-gray-200 rounded-lg'></div> {/* Placeholder for image */}
                        <h3 className='mt-6 text-xl font-semibold'>{member.name}</h3>
                    </div>
                    ))}
                </div>
                </div>
            </div>
            </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
