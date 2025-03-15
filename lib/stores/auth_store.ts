"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { verifyJWT } from "../jwt";

interface AuthStates {
	token: string | null;
	isAuthenticated: boolean;
	setAuth: (token: string) => void;
	getCurrentUser: () => Promise<any | null>;
	logout: () => void;
}

export const useAuthStore = create<AuthStates>()(
	persist(
		(set, get) => ({
			token: null,
			isAuthenticated: false,
			setAuth: (token) => set({ token, isAuthenticated: true }),
			logout: () => set({ token: null, isAuthenticated: false }),
			getCurrentUser: async () => {
				const data = await verifyJWT(get().token as string);
				if (data?.payload) {
					return data?.payload;
				}
				return null;
			},
		}),
		{
			name: "bravo-auth-storage",
		},
	),
);
