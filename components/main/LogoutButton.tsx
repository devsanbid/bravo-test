"use client";

import { logout } from "@/controllers/AuthController";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";

export function LogoutButton() {
	const router = useRouter();
	const { setUser, setLoading } = useAuthStore();

	async function handleLogout() {
		setLoading(true);
		try {
			await logout();
			setUser(null);
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setLoading(false);
		}
	}
	return <button className="bg-red-300 text-white p-5 px-10 border" onClick={handleLogout}>Logout</button>;
}
