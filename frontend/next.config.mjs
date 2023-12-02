import { next } from 'million/compiler';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  env: {
    COMPASS: process.env.COMPASS,
    BACKEND: process.env.BACKEND,
  },
  async rewrites() {
    return [
      { source: '/login', destination: process.env.BACKEND + '/login/' },
      { source: '/logout', destination: process.env.BACKEND + '/logout/' },
      { source: '/authenticate', destination: process.env.BACKEND + '/authenticate/' },
      { source: '/profile', destination: process.env.BACKEND + '/profile/' },
      { source: '/update_profile', destination: process.env.BACKEND + '/update_profile/' },
      { source: '/csrf', destination: process.env.BACKEND + '/csrf/' },
      { source: '/search', destination: process.env.BACKEND + '/search/' },
      { source: '/get_courses', destination: process.env.BACKEND + '/get_courses/' },
      {
        source: '/update_courses',
        destination: process.env.BACKEND + '/update_courses/',
      },
      { source: '/check_requirements', destination: process.env.BACKEND + '/check_requirements/' },
      { source: '/update_user', destination: process.env.BACKEND + '/update_user/' },
    ];
  },
};

const millionConfig = {
  auto: { rsc: true },
};

export default next(nextConfig, millionConfig);
