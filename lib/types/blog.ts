export interface Blog {
    id: string;
    title: string;
    content: string; // HTML content
    authorId: string;
    authorName: string;
    published: boolean;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    slug: string;
    excerpt?: string; // Optional
    featuredImage?: string; // Optional - ID of the image in Appwrite storage
    tags?: string; // Optional
    categories?: string[]; //Optional
}
