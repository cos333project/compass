import Skeleton from '@mui/joy/Skeleton';

export default function Loading() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      {/* Body container */}
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* Left sidebar with search bar */}
        <div style={{ width: '29%', marginRight: '12px', marginLeft: '12px' }}>
          <Skeleton
            variant='rectangular'
            height='110px'
            sx={{ mt: '10px', bgcolor: 'red', backgroundColor: '#f6f6f6', animation: 'none' }}
          />
          <Skeleton
            variant='rectangular'
            height='calc(100vh - 120px)'
            sx={{ mt: '2px', bgcolor: 'red', backgroundColor: '#f6f6f6', animation: 'none' }}
          />
        </div>

        {/* Middle 2x4 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridAutoRows: '1fr',
            gap: '25px',
            width: '53%',
            height: 'full',
            marginTop: '10px',
            marginLeft: '10px',
          }}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              variant='rectangular'
              sx={{ bgcolor: 'red', backgroundColor: '#f6f6f6', animation: 'none' }}
            />
          ))}
        </div>

        {/* Right large vertical space */}
        <div style={{ width: '28%', marginRight: '12px', marginLeft: '20px', marginTop: '10px' }}>
          <Skeleton
            variant='rectangular'
            height='calc(100vh)'
            sx={{ mt: '2px', bgcolor: 'red', backgroundColor: '#f6f6f6', animation: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}