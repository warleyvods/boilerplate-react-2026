import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/lib/schemas';
import { ChangePasswordModal, setPasswordSchema } from './change-password-modal';

const setPassword = vi.fn();
vi.mock('@/hooks/users/use-set-password', () => ({
    useSetPassword: () => ({ mutate: setPassword, isPending: false }),
}));

const user: User = { id: 7, name: 'João', email: 'joao@example.com', active: true, admin: false };

describe('setPasswordSchema', () => {
    it('exige confirmação igual', () => {
        const result = setPasswordSchema.safeParse({ password: '123456', confirmPassword: '654321' });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]).toMatchObject({ path: ['confirmPassword'], message: 'As senhas não coincidem' });
    });
});

describe('ChangePasswordModal', () => {
    beforeEach(() => setPassword.mockReset());

    it('só habilita o envio com senhas válidas e envia id + senha', async () => {
        const ue = userEvent.setup();
        render(<ChangePasswordModal open onOpenChange={() => {}} user={user} />);

        const submit = screen.getByRole('button', { name: /alterar senha/i });
        expect(submit).toBeDisabled();

        await ue.type(screen.getByLabelText('Nova Senha'), 'segredo1');
        await ue.type(screen.getByLabelText('Confirmar Nova Senha'), 'diferente');
        await waitFor(() => expect(submit).toBeDisabled());

        await ue.clear(screen.getByLabelText('Confirmar Nova Senha'));
        await ue.type(screen.getByLabelText('Confirmar Nova Senha'), 'segredo1');
        await waitFor(() => expect(submit).toBeEnabled());

        await ue.click(submit);
        await waitFor(() => expect(setPassword).toHaveBeenCalledWith({ id: 7, password: 'segredo1' }));
    });

    it('não renderiza nada sem usuário', () => {
        const { container } = render(<ChangePasswordModal open onOpenChange={() => {}} user={null} />);
        expect(container).toBeEmptyDOMElement();
    });
});
