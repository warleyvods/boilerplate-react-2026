import { QueryClient, isServer } from '@tanstack/react-query';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
                retry: 1,
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 0,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

/**
 * No servidor cria um QueryClient novo por request (não vaza cache entre usuários).
 * No browser reaproveita um singleton, para não perder o cache se o React
 * suspender durante o primeiro render.
 */
export function getQueryClient() {
    if (isServer) {
        return makeQueryClient();
    }
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
}
