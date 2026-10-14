'use client';

import { useRef, useImperativeHandle } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';
import { cn } from '@/lib/utils';

interface CustomScrollbarProps {
    children: React.ReactNode;
    className?: string;
    maxHeight?: string;
    style?: React.CSSProperties;
    /** Recebe o viewport (elemento que rola) do OverlayScrollbars. */
    ref?: React.Ref<HTMLDivElement>;
}

export function CustomScrollbar({ children, className, maxHeight, style, ref }: CustomScrollbarProps) {
    const overlayRef = useRef<OverlayScrollbarsComponentRef<'div'>>(null);

    useImperativeHandle(ref, () => {
        const instance = overlayRef.current?.osInstance();
        const elements = instance?.elements();
        return elements?.viewport as HTMLDivElement;
    }, []);

    return (
        <OverlayScrollbarsComponent
            ref={overlayRef}
            className={cn('custom-scrollbar', className)}
            style={{ maxHeight, ...style }}
            options={{
                scrollbars: {
                    theme: 'os-theme-dark os-theme-light',
                    visibility: 'auto',
                    autoHide: 'move',
                    autoHideDelay: 1000,
                    clickScroll: true,
                },
                overflow: {
                    x: 'hidden',
                    y: 'scroll',
                },
            }}
        >
            {children}
        </OverlayScrollbarsComponent>
    );
}
