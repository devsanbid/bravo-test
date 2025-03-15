"use server";
import { Client, Account, Databases } from "node-appwrite";
import { cookies } from "next/headers";

const sessionName = `a_session_${process.env.NEXT_PUBLIC_PROJECTID}`;

export async function createSessionClient() {
	const client = new Client()
		.setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT as string)
		.setProject(process.env.NEXT_PUBLIC_PROJECTID as string);

	const cookies_store = await cookies();
	const session = cookies_store.get("bravo-session");

	if (!session || !session.value) {
		throw new Error("No session");
	}

	return {
		get account() {
			return new Account(client);
		},

		get database() {
			return new Databases(client);
		},
	};
}

export async function createAdminClient() {
	const client = new Client()
		.setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT as string)
		.setProject(process.env.NEXT_PUBLIC_PROJECTID as string)
		.setKey(process.env.APPWRITE_API_KEY as string);

	return {
		get account() {
			return new Account(client);
		},
		get databases() {
			return new Databases(client);
		},
	};
}
