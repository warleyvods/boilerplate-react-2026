import type { NextConfig } from "next";

const nextConfig: NextConfig = {
};

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
