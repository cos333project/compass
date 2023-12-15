import withPWA from 'next-pwa';
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
  ...withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
  }),
};

export default nextConfig;
