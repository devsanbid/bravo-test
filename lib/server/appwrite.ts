"use server";
import { Client, Account, Databases, Storage } from "node-appwrite";
import { cookies } from "next/headers";

export async function createSessionClient() {
	const client = new Client()
		.setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT as string)
		.setProject(process.env.NEXT_PUBLIC_PROJECTID as string);

	const cookies_store = await cookies();
	const session = cookies_store.get("bravo-session");

	if (!session || !session.value) {
		throw new Error("No session");
	}

	// Set the session token
	client.setSession(session.value);

	return {
		get client() {
			return client;
		},
		get account() {
			return new Account(client);
		},

		get database() {
			return new Databases(client);
		},
		get storage() {
			return new Storage(client);
		}
	};
}

export async function createAdminClient() {
	const client = new Client()
		.setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT as string)
		.setProject(process.env.NEXT_PUBLIC_PROJECTID as string)
		.setKey(process.env.APPWRITE_API_KEY as string);

	return {
		get client() {
			return client;
		},

		get account() {
			return new Account(client);
		},
		get databases() {
			return new Databases(client);
		},
		get storage() {
			return new Storage(client);
		},
	};
}
