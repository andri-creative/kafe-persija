"use client";

import { useState, useEffect, useCallback } from "react";

interface PermissionsState {
    permissions: string[];
    roles: string[];
    loading: boolean;
}

const CACHE_KEY = "user_permissions_cache";
const CACHE_TTL_MS = 60 * 1000; // 1 menit

function getCache(): PermissionsState | null {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL_MS) {
            sessionStorage.removeItem(CACHE_KEY);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function setCache(data: PermissionsState) {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch { }
}

export function clearPermissionsCache() {
    try {
        sessionStorage.removeItem(CACHE_KEY);
    } catch { }
}

export function usePermissions() {
    const [state, setState] = useState<PermissionsState>({
        permissions: [],
        roles: [],
        loading: true,
    });

    useEffect(() => {
        const cached = getCache();
        if (cached) {
            setState(cached);
            return;
        }

        fetch("/api/me/permissions")
            .then((res) => res.json())
            .then((data) => {
                const result: PermissionsState = {
                    permissions: data.permissions ?? [],
                    roles: data.roles ?? [],
                    loading: false,
                };
                setCache(result);
                setState(result);
            })
            .catch(() => {
                setState({ permissions: [], roles: [], loading: false });
            });
    }, []);

    const can = useCallback(
        (permission: string): boolean => {
            if (state.loading) return false;
            return state.permissions.includes(permission);
        },
        [state]
    );

    const canAny = useCallback(
        (permissions: string[]): boolean => {
            if (state.loading) return false;
            return permissions.some((p) => state.permissions.includes(p));
        },
        [state]
    );

    const canAll = useCallback(
        (permissions: string[]): boolean => {
            if (state.loading) return false;
            return permissions.every((p) => state.permissions.includes(p));
        },
        [state]
    );

    return { ...state, can, canAny, canAll };
}
