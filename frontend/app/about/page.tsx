'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';

import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../store/authSlice';

const teamMembers = [
  {
    name: 'Windsor Nguyen',
    gradYear: '2025',
    link: 'https://www.linkedin.com/in/windsornguyen/',
  },
  {
    name: 'Ijay Narang',
    gradYear: '2025',
    link: 'https://www.linkedin.com/in/ijay-narang-20b968216/',
  },
  {
    name: 'Kaan Odabas',
    gradYear: '2025',
    link: 'https://www.linkedin.com/in/kaanbodabas/',
  },
  {
    name: 'George Chiriac',
    gradYear: '2025',
    link: 'https://www.linkedin.com/in/george-chiriac/',
  },
  {
    name: 'Julia Kashimura',
    gradYear: '2025',
    link: 'https://www.linkedin.com/in/juliakashimura/',
  },
];

const navigation = [
  {
    name: 'LinkedIn',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        x='0px'
        y='0px'
        width='36'
        height='36'
        viewBox='0 0 48 48'
        {...props}
      >
        <path
          fill='#0288D1'
          d='M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z'
        />
        <path
          fill='#FFF'
          d='M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z'
        />
      </svg>
    ),
  },
];

const About = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { checkAuthentication } = useAuthStore();
  useEffect(() => {
    checkAuthentication().then(() => setIsLoading(false));
  }, [checkAuthentication]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className='flex flex-col min-h-screen pt-10 rounded-xl '>
          <div className='relative isolate pt-14'>
            <div className='flex flex-col min-h-screen pt-24'>
              {/* Background Gradient Effect */}
              <div
                className='absolute inset-x-0 -top-40 z-0 transform-gpu overflow-hidden blur-3xl sm:-top-80'
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
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className='flex flex-col min-h-screen pt-10 rounded-xl overflow-x-hidden'>
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
          <div className='py-12 sm:py-16 lg:pb-20'>
            <div className='mx-auto max-w-7xl'>
              <div className='text-center justify-center text-[var(--system-text-color)]'>
                <h2 className='text-3xl font-bold sm:text-4xl'>Meet the Team</h2>
                <p className='mt-3 max-w-2xl mx-auto text-xl'>
                  The dedicated group of individuals behind the Compass project.
                </p>
              </div>
              <div className='mt-12 text-black overflow-x-auto'>
                {/* First Row - 5 members */}
                <div className='flex xl:justify-center justify-start gap-6'>
                  {teamMembers.map((member, index) => (
                    <div key={member.name} className='bg-white p-6 rounded-lg shadow-sm'>
                      {/* Adjusted image style to be more square */}
                      <div className='h-[180px] w-[180px] overflow-hidden rounded-lg'>
                        <Image
                          src={`/member${index + 1}.jpg`}
                          alt={member.name}
                          width={180}
                          height={180}
                        />
                      </div>
                      <h3 className='mt-6 text-xl font-semibold'>{member.name}</h3>
                      <div className='flow-root'>
                        {/* Graduation year */}
                        <p className='float-left text-xl'>{member.gradYear}</p>{' '}
                        <p className='float-right'>
                          {navigation.map((item) => (
                            <a
                              key={item.name}
                              href={member.link}
                              className='text-gray-400 hover:text-gray-500'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <span className='sr-only'>{item.name}</span>
                              <item.icon className='h-6 w-6' aria-hidden='true' />
                            </a>
                          ))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Second Row - 3 members */}
                {/* <div className='mt-8 flex gap-8'>
                  {teamMembers.slice(2).map((member, index) => (
                    <div key={member.name} className='mx-auto bg-white p-6 rounded-lg shadow-sm w-[300px]'>
                      <div className='h-[240px] w-[240px] mx-auto overflow-hidden rounded-lg'>
                        <Image
                          src={`/member${index + 3}.jpg`}
                          alt={member.name}
                          width={240}
                          height={240}
                        />
                      </div>
                      <h3 className='mt-6 text-2xl font-semibold'>{member.name}</h3>
                      <div className='flow-root'>
                        <p className='float-left text-2xl'>{member.gradYear}</p>{' '}
                        <p className='float-right'>
                          {navigation.map((item) => (
                            <a
                              key={item.name}
                              href={member.link}
                              className='text-gray-400 hover:text-gray-500'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <span className='sr-only'>{item.name}</span>
                              <item.icon className='h-6 w-6' aria-hidden='true' />
                            </a>
                          ))}
                        </p>
                      </div>
                    </div>
                  ))} */}
                {/* </div> */}
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
