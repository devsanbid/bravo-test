"use server";
import { ID } from "@/lib/appwrite/config"; // Adjust path if needed
import { createJWT, verifyJWT } from "@/lib/jwt";
import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { cookies } from "next/headers";
import { Query } from "node-appwrite";

const sessionName = `a_session_${process.env.NEXT_PUBLIC_PROJECTID}`;

// Function to check if the current user's email is verified
export async function isEmailVerified() {
	try {
		const { account } = await createSessionClient();
		const user = await account.get();

		// Appwrite stores email verification status in the emailVerification property
		return user?.emailVerification || false;
	} catch (error) {
		console.error("Email verification check error:", error);
		return false;
	}
}

// Function to send a verification email
export async function sendVerificationEmail() {
	try {
		const { account } = await createSessionClient();
		await account.createVerification(
			process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
		);
		return { success: true };
	} catch (error) {
		console.error("Send verification email error:", error);
		throw error;
	}
}
export async function register(
	email: string,
	password: string,
	firstName: string,
	middleName: string,
	lastName: string,
	gender: string,
	dateOfBirth: Date,
	phone: string,
	service: string,
) {
	try {
		const { account, databases } = await createAdminClient();
		const userId = ID.unique();
		console.log("Generated userId:", userId); // Debug log
		const user = await account.create(
			userId,
			email,
			password,
			`${firstName} ${lastName}`,
		);

		console.log(user);

		await databases.createDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.NEXT_PUBLIC_COLLECTID || "",
			ID.unique(),
			{
				userId: user.$id,
				firstName,
				middleName: middleName || "",
				lastName,
				email,
				gender,
				dateOfBirth: dateOfBirth.toISOString(),
				phone,
				service,
				role: "student",
			},
		);

		console.log(user);
		return user;
	} catch (error) {
		console.error("Register error:", error);
		throw error;
	}
}

export async function login(email: string, password: string) {
	try {
		const { account, databases } = await createAdminClient();
		const session = await account.createEmailPasswordSession(email, password);

		const result = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID as string,
			process.env.NEXT_PUBLIC_COLLECTID as string,
			[Query.equal("userId", session.userId)],
		);

		const userData = result.documents[0];
		console.log("userData: ", userData);

		const token = await createJWT(userData);

		const cookieStore = await cookies();
		cookieStore.set("bravo-session", token, {
			path: "/",
			httpOnly: true,
			sameSite: "strict",
			secure: true,
		});

		return { userData, token };
	} catch (error) {
		console.error("Login error:", error);
		throw error;
	}
}

export async function getCurrentUser() {
	try {
		const tokenStore = await cookies();
		const token = tokenStore.get("bravo-session")?.value;

		if (!token) {
			throw new Error("Unauthorized");
		}

		const payload = await verifyJWT(token);
		if (!payload) {
			throw new Error("Invalid token");
		}
		return payload.payload;
	} catch (error) {
		console.log("error: ", error);
		return null;
	}
}

export async function logout() {
	try {
		const { account } = await createSessionClient();
		(await cookies()).delete(sessionName);
		await account.deleteSession("current");
	} catch (error) {
		console.error("Logout error:", error);
		throw error;
	}
}

export async function forgotPassword(email: string) {
	try {
		const { account } = await createSessionClient();
		await account.createRecovery(email, "http://localhost:3000/reset-password");
	} catch (error) {
		console.error("Forgot password error:", error);
		throw error;
	}
}

export async function resetPassword(
	userId: string,
	secret: string,
	password: string,
) {
	try {
		const { account } = await createSessionClient();
		await account.updateRecovery(userId, secret, password);
	} catch (error) {
		console.error("Reset password error:", error);
		throw error;
	}
}
