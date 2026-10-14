'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Shield, ShieldCheck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useUpdateUser } from '@/hooks/users/use-update-user';
import { updateUserSchema, UpdateUserFormData, User } from '@/lib/schemas';

interface EditUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function EditUserModal({ open, onOpenChange, user }: EditUserModalProps) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, submitCount },
    } = useForm<UpdateUserFormData>({
        resolver: zodResolver(updateUserSchema),
        // `values` repreenche o formulário sempre que o usuário selecionado muda
        values: user ? {
            name: user.name,
            login: user.login,
            email: user.email,
            admin: user.admin,
            active: user.active,
        } : undefined,
    });

    const { mutate: updateUser, isPending } = useUpdateUser(
        () => {
            onOpenChange(false);
            reset();
        }
    );

    const onSubmit = (values: UpdateUserFormData) => {
        if (!user) return;
        updateUser({ id: user.id, ...values });
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
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Edit2 className="h-6 w-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">Editar Usuário</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        Atualize as informações de <strong>{user.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                    {/* Nome Completo */}
                    <Field
                        label="Nome Completo"
                        placeholder="Ex: João Silva Santos"
                        error={errors.name?.message}
                        submitCount={submitCount}
                        {...register('name')}
                    />

                    {/* Login */}
                    <Field
                        label="Login de Acesso"
                        placeholder="Ex: joao.silva"
                        error={errors.login?.message}
                        submitCount={submitCount}
                        {...register('login')}
                    />

                    {/* Email */}
                    <Field
                        label="Email"
                        type="email"
                        placeholder="Ex: joao.silva@empresa.com"
                        error={errors.email?.message}
                        submitCount={submitCount}
                        {...register('email')}
                    />

                    {/* Permissões */}
                    <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-medium">Permissões do Usuário</Label>
                        </div>

                        <div className="space-y-3">
                            {/* Usuário Ativo */}
                            <div className="flex items-center space-x-2">
                                <Controller
                                    control={control}
                                    name="active"
                                    render={({ field }) => (
                                        <Checkbox
                                            id="active"
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(checked === true)}
                                        />
                                    )}
                                />
                                <Label
                                    htmlFor="active"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                >
                                    Usuário ativo
                                </Label>
                            </div>

                            {/* Administrador */}
                            <div className="flex items-start space-x-2">
                                <Controller
                                    control={control}
                                    name="admin"
                                    render={({ field }) => (
                                        <Checkbox
                                            id="admin"
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(checked === true)}
                                        />
                                    )}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor="admin"
                                        className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                                    >
                                        <ShieldCheck className="h-3 w-3" />
                                        Administrador do sistema
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Poderá gerenciar usuários e configurações avançadas
                                    </p>
                                </div>
                            </div>
                        </div>
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
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>Salvando...</>
                            ) : (
                                <>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
