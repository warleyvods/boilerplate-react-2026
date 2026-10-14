'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Key } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { useSetPassword } from '@/hooks/users/use-set-password';
import { User } from '@/lib/schemas';

// Schema simplifying for Admin reset (no current password needed)
export const setPasswordSchema = z.object({
    password: z.string().min(1, 'Nova senha é obrigatória').min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

interface ChangePasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function ChangePasswordModal({ open, onOpenChange, user }: ChangePasswordModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, submitCount, isValid, isDirty },
    } = useForm<SetPasswordFormData>({
        resolver: zodResolver(setPasswordSchema),
        mode: 'onChange',
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    const { mutate: setPassword, isPending } = useSetPassword(handleClose);

    const onSubmit = (values: SetPasswordFormData) => {
        if (!user) return;
        // Admin reset password
        setPassword({ id: user.id, password: values.password });
    };

    // Reset form when modal closes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset();
        }
        onOpenChange(newOpen);
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Key className="h-6 w-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">
                            Redefinir Senha
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        Defina uma nova senha para <strong>{user.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">

                    {/* Nova Senha */}
                    <div className="space-y-1">
                        <PasswordField
                            label="Nova Senha"
                            placeholder="Digite a nova senha"
                            error={errors.password?.message}
                            submitCount={submitCount}
                            required
                            {...register('password')}
                        />
                        {!errors.password && (
                            <p className="text-xs text-muted-foreground">
                                Mínimo de 6 caracteres
                            </p>
                        )}
                    </div>

                    {/* Confirmar Senha */}
                    <PasswordField
                        label="Confirmar Nova Senha"
                        placeholder="Digite a senha novamente"
                        error={errors.confirmPassword?.message}
                        submitCount={submitCount}
                        required
                        {...register('confirmPassword')}
                    />

                    {/* Info */}
                    <div className="rounded-lg bg-muted/50 p-3 mt-4">
                        <p className="text-sm text-muted-foreground">
                            ⚠️ Esta ação irá alterar a senha do usuário imediatamente.
                        </p>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="flex-1"
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isPending || !isValid || !isDirty}
                        >
                            {isPending ? (
                                <>Alterando...</>
                            ) : (
                                <>
                                    <Key className="h-4 w-4 mr-2" />
                                    Alterar Senha
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
