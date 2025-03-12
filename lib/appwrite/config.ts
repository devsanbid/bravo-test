import { Client, Account, Databases, Storage, ID } from 'node-appwrite';

const endpoint: string = process.env.NEXT_PUBLIC_ENDPOINT || ""
const projectId: string = process.env.NEXT_PUBLIC_PROJECTID || ""

const client = new Client()
    .setEndpoint(endpoint) 
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { client, ID };
