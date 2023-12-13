'use client';

import Image from 'next/image';

import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

const teamMembers = [
  { name: 'Windsor Nguyen', gradYear: '2025' },
  { name: 'Ijay Narang', gradYear: '2025' },
  { name: 'Kaan Odabas', gradYear: '2025' },
  { name: 'George Chiriac', gradYear: '2025' },
  { name: 'Julia Kashimura', gradYear: '2025' },
];

const About = () => {
  return (
    <>
      <Navbar />
      <div className='flex flex-col min-h-screen pt-10 rounded-xl'>
        <div className='relative isolate pt-14'>
          {/* Background Gradient Effect */}
          <div
            className='absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'
            aria-hidden='true'
          >
            <div
              className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          {/* Team Members Section */}
          <div className='bg-gray-100 py-12 sm:py-16 lg:pb-20'>
            <div className='mx-auto max-w-7xl px-6 lg:px-8'>
              <div className='text-center'>
                <h2 className='text-3xl font-bold sm:text-4xl'>Meet the Team</h2>
                <p className='mt-3 max-w-2xl mx-auto text-xl'>
                  A dedicated group of individuals behind the Compass project.
                </p>
              </div>
              <div className='mt-12'>
                {/* First Row - 2 members */}
                <div className='flex justify-center gap-8'>
                  {teamMembers.slice(0, 2).map((member, index) => (
                    <div key={member.name} className='bg-white p-6 rounded-lg shadow-sm w-[300px]'>
                      {/* Adjusted image style to be more square */}
                      <div className='h-[240px] w-[240px] mx-auto overflow-hidden rounded-lg'>
                        <Image
                          src={`/member${index + 1}.jpg`}
                          alt={member.name}
                          width={240}
                          height={240}
                        />
                      </div>
                      <h3 className='mt-6 text-xl font-semibold'>{member.name}</h3>
                      <p className='text-sm text-gray-600'>{member.gradYear}</p>{' '}
                      {/* Graduation year */}
                    </div>
                  ))}
                </div>
                {/* Second Row - 3 members */}
                <div className='mt-8 flex justify-center gap-8'>
                  {teamMembers.slice(2).map((member, index) => (
                    <div key={member.name} className='bg-white p-6 rounded-lg shadow-sm w-[300px]'>
                      {/* Adjusted image style to be more square */}
                      <div className='h-[240px] w-[240px] mx-auto overflow-hidden rounded-lg'>
                        <img
                          src={`/member${index + 3}.jpg`}
                          alt={member.name}
                          className='object-cover w-full h-full'
                        />
                      </div>
                      <h3 className='mt-6 text-xl font-semibold'>{member.name}</h3>
                      <p className='text-sm text-gray-600'>{member.gradYear}</p>{' '}
                      {/* Graduation year */}
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
