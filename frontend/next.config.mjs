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
};

const millionConfig = {
  auto: { rsc: true },
};

export default next(nextConfig, millionConfig);
