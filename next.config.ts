import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler: memoização automática (substitui useMemo/useCallback manuais)
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
};

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
