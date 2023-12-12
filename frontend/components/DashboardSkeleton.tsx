import Skeleton from '@mui/joy/Skeleton';

export default function DashboardSkeleton() {
  const skeletonStyle = {
    backgroundColor: '#f6f6f6',
    animation: 'none',
    borderRadius: '0.5rem', // Rounded corners
  };

  return (
    <div className='flex w-screen h-screen'>
      <div className='flex w-full h-full'>
        {/* Left sidebar with search bar */}
        <div className='flex flex-col w-29% mx-3'>
          <Skeleton variant='rectangular' height='98px' sx={{ mt: '10px', ...skeletonStyle }} />
          <Skeleton
            variant='rectangular'
            height='calc(100vh - 110px)'
            sx={{ mt: '2px', ...skeletonStyle }}
          />
        </div>

        {/* Middle 2x4 grid */}
        <div className='grid grid-cols-2 auto-rows-minmax[155px_auto] gap-6 w-53% mt-2.5 ml-2.5'>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} variant='rectangular' height='155px' sx={skeletonStyle} />
          ))}
        </div>

        {/* Right large vertical space */}
        <div className='w-28% mx-3 mt-2.5'>
          <Skeleton
            variant='rectangular'
            height='calc(100vh - 13px)'
            sx={{ mt: '2px', ...skeletonStyle }}
          />
        </div>
      </div>
    </div>
  );
}
