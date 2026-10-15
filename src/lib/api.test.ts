// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api';

describe('getApiErrorMessage', () => {
    it('lê o message do ProblemDetail da API', () => {
        expect(getApiErrorMessage({
            title: 'Bad Request',
            status: 400,
            detail: 'Email já cadastrado',
            message: 'Email já cadastrado',
            error: 'Bad Request',
            fields: {},
        })).toBe('Email já cadastrado');
    });

    it('cai para detail quando não há message', () => {
        expect(getApiErrorMessage({ title: 'Not Found', status: 404, detail: 'Usuário não encontrado' }))
            .toBe('Usuário não encontrado');
    });

    it('aceita o formato antigo (details/error)', () => {
        expect(getApiErrorMessage({ details: 'Formato antigo' })).toBe('Formato antigo');
        expect(getApiErrorMessage({ error: 'Unauthorized' })).toBe('Unauthorized');
    });

    it('devolve string vazia sem corpo', () => {
        expect(getApiErrorMessage(undefined)).toBe('');
        expect(getApiErrorMessage(null)).toBe('');
    });
});
