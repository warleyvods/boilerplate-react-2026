import { describe, expect, it } from 'vitest';
import { changePasswordSchema, CreateUserRequestSchema } from './schemas';

describe('changePasswordSchema', () => {
    it('aceita senhas válidas e iguais', () => {
        const result = changePasswordSchema.safeParse({
            currentPassword: 'atual123',
            newPassword: 'novaSenha123',
            confirmPassword: 'novaSenha123',
        });
        expect(result.success).toBe(true);
    });

    it('acusa confirmação diferente no campo confirmPassword', () => {
        const result = changePasswordSchema.safeParse({
            currentPassword: 'atual123',
            newPassword: 'novaSenha123',
            confirmPassword: 'outraSenha',
        });
        expect(result.success).toBe(false);
        const issue = result.error?.issues.find((i) => i.path[0] === 'confirmPassword');
        expect(issue?.message).toBe('Senhas não coincidem');
    });

    it('exige nova senha com 8+ caracteres', () => {
        const result = changePasswordSchema.safeParse({
            currentPassword: 'atual123',
            newPassword: 'curta',
            confirmPassword: 'curta',
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['newPassword']);
    });
});

describe('CreateUserRequestSchema', () => {
    it('rejeita email inválido e nome curto', () => {
        const result = CreateUserRequestSchema.safeParse({ name: 'Jo', email: 'invalido', password: '12345678' });
        expect(result.success).toBe(false);
        expect(result.error?.issues.map((i) => i.path[0]).sort()).toEqual(['email', 'name']);
    });
});
