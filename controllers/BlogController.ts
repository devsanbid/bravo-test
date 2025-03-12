"use server"
import { ID } from "@/lib/appwrite/config";
import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { Query } from "node-appwrite";
import { Blog } from "@/lib/types/blog";

// Create a new blog post
export async function createBlogPost(blogPost: Omit<Blog, "id" | "createdAt" | "updatedAt">) {
    try {
        const { databases } = await createAdminClient();
        const blogId = ID.unique();
        console.log("type of content", typeof(blogPost.content))
        const newBlogPost = await databases.createDocument(
            process.env.NEXT_PUBLIC_DATABASEID || "",
            process.env.BLOG_ID || "",
            blogId,
            {
                id: blogId,
                ...blogPost,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        );

        return newBlogPost;
    } catch (error) {
        console.error("Error creating blog post:", error);
        throw error; // Re-throw the error so the calling function can handle it
    }
}

// Get all blog posts (with pagination and filtering)
// TODO: Add filtering options (e.g., by author, category, tags)
export async function getBlogPosts(limit = 25, offset = 0, forStaticGeneration = false) {
    try {
        const { databases } = forStaticGeneration ? await createAdminClient() : await createSessionClient();
        const posts = await databases.listDocuments(
            process.env.NEXT_PUBLIC_DATABASEID || "",
            process.env.BLOG_ID || "",
            [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc("createdAt"), // Newest posts first
                ...(forStaticGeneration ? [] : [Query.equal("published", true)]), // Only published posts
            ]
        );
        return posts.documents;
    } catch (error) {
        console.error("Error getting blog posts:", error);
        throw error;
    }
}

// Get a single blog post by ID
export async function getBlogPostById(id: string) {
    try {
        const { databases } = await createAdminClient();
        const post = await databases.getDocument(
            process.env.NEXT_PUBLIC_DATABASEID || "",
            process.env.BLOG_ID || "",
            id
        );
        return post;
    } catch (error) {
        console.error("Error getting blog post by ID:", error);
        throw error; // Might want to handle 404 specifically
    }
}

// Update an existing blog post
export async function updateBlogPost(id: string, blogPost: Partial<Blog>) {
    try {
        const { databases } = await createAdminClient();
        const updatedPost = await databases.updateDocument(
            process.env.NEXT_PUBLIC_DATABASEID || "",
            process.env.BLOG_ID || "",
            id,
            {
                ...blogPost,
                updatedAt: new Date().toISOString(), // Always update updatedAt
            },
        );
        return updatedPost;
    } catch (error) {
        console.error("Error updating blog post:", error);
        throw error;
    }
}

// Delete a blog post
export async function deleteBlogPost(id: string) {
    try {
        const { databases } = await createAdminClient();
        await databases.deleteDocument(
            process.env.NEXT_PUBLIC_DATABASEID || "",
            process.env.BLOG_ID || "",
            id
        );
        return { success: true };
    } catch (error) {
        console.error("Error deleting blog post:", error);
        throw error;
    }
}
