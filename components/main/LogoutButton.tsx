"use client";

import { logout as Logout } from "@/controllers/AuthController";
import { useAuthStore } from "@/lib/stores/auth_store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
	const router = useRouter();
	const { logout } = useAuthStore();
	const [loading, setLoading] = useState<boolean>(false);

	async function handleLogout() {
		setLoading(true);
		try {
			logout();
			await Logout();
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setLoading(false);
		}
	}
	return (
		<button
			className="bg-red-300 text-white p-5 px-10 border"
			onClick={handleLogout}
		>
			Logout
		</button>
	);
}
