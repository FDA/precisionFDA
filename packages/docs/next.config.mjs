/** @type {import('next').NextConfig} */
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const config = {
  reactStrictMode: true,
  output: "standalone",
  basePath: "/docs",
};

export default withMDX(config);
