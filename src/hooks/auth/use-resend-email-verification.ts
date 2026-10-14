import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api, type ApiErrorBody } from '@/lib/api';

export function useResendEmailVerification(onSuccess?: () => void, onError?: () => void) {
    return useMutation<unknown, AxiosError<ApiErrorBody>, { email: string }>({
        mutationFn: async (data: { email: string }) => {
            const response = await api.post('/v1/users/public/resend-verification', data);
            return response.data;
        },
        onSuccess: () => {
            onSuccess?.();
        },
        onError: () => {
            onError?.();
        }
    });
}
