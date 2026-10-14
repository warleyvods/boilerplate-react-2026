'use client';

import { createContext, useContext, ReactNode, useSyncExternalStore } from 'react';

interface SidebarContextType {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = 'boilerplate-sidebar-expanded';

// A preferência vive no localStorage; useSyncExternalStore lê sem setState em
// effect e usa `true` (expandida) no servidor e na hidratação.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    try {
        return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false';
    } catch {
        return true;
    }
}

function setStoredExpanded(expanded: boolean) {
    try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, expanded.toString());
    } catch {
        // localStorage indisponível
    }
    listeners.forEach((listener) => listener());
}

export function SidebarProvider({ children }: { children: ReactNode }) {
    const isExpanded = useSyncExternalStore(subscribe, getSnapshot, () => true);

    const toggleSidebar = () => setStoredExpanded(!isExpanded);

    return (
        <SidebarContext.Provider value={{ isExpanded, setIsExpanded: setStoredExpanded, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
