import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { QueryKeys } from '@/lib/query-keys';
import { useUserStore, type User } from '@/stores/useUserStore';
import { useEffect } from 'react';

/**
 * Busca o usuário logado em /v1/users/me.
 *
 * A sessão vive em cookies httpOnly (invisíveis ao JS), então não há como saber
 * no cliente se existe token: a query sempre roda e a API decide. Um 401 (já
 * depois da tentativa de refresh do interceptor) limpa o store local.
 */
export function useCurrentUser() {
    const { user, setUser, logout } = useUserStore();

    const query = useQuery({
        queryKey: [QueryKeys.CURRENT_USER],
        queryFn: async () => {
            const response = await api.get<User>('/v1/users/me');
            return response.data;
        },
        retry: false,
    });

    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        }
    }, [query.data, setUser]);

    const isUnauthorized = isAxiosError(query.error) && query.error.response?.status === 401;

    useEffect(() => {
        if (isUnauthorized) {
            logout();
        }
    }, [isUnauthorized, logout]);

    return { ...query, user: query.data ?? user };
}
