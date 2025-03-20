"use client";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost } from "@/controllers/BlogController";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Blog } from "@/lib/types/blog";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/lib/stores/auth_store";
import type { UserDataInterface } from "@/lib/type";

// Dynamically import Tiptap editor (more React 18 friendly than ReactQuill)
const TiptapEditor = dynamic(() => import("./TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-60 border rounded-md flex items-center justify-center">
      Loading editor...
    </div>
  ),
});

type BlogFormData = {
  title: string;
  content: string;
  excerpt: string;
  authorName: string;
  authorId: string;
  featuredImage: string;
  tags: string;
  published: boolean;
};

export default function CreateBlogPage() {
  const [user, setUser] = useState<UserDataInterface | null>(null);
  const { getCurrentUser } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    content: "",
    excerpt: "",
    authorName: "",
    authorId: "",
    featuredImage: "",
    tags: "",
    published: false,
  });

  // For tracking if editor is loaded
  const [editorLoaded, setEditorLoaded] = useState(false);

  // Set editor as loaded after mount and fetch user data
  useEffect(() => {
    setEditorLoaded(true);
    
    async function loadUser() {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        // Update form data with user information
        setFormData(prevData => ({
          ...prevData,
          authorName: userData.firstName || "",
          authorId: userData.userId || "",
        }));
      }
    }
    
    loadUser();
  }, [getCurrentUser]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle Tiptap editor content changes
  const handleEditorChange = (content: string) => {
    setFormData({
      ...formData,
      content: String(content),
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      published: checked,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Simple validation
    if (!formData.content || formData.content === "<p></p>") {
      toast.error("Please add some content to your blog post");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format tags as array if provided
      const formattedData: Omit<Blog, "id" | "createdAt" | "updatedAt"> = {
        ...formData,
        tags: formData.tags
      };

      await createBlogPost(formattedData);
      toast.success("Blog post created successfully");
      router.push("/mod/blog");
      router.refresh();
    } catch (error) {
      console.error("Failed to create blog post:", error);
      toast.error("Failed to create blog post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Post Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a compelling title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Brief summary of your post"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              {editorLoaded && (
                <div className="bg-white border rounded-md">
                  <TiptapEditor
                    content={formData.content}
                    onChange={handleEditorChange}
                  />
                </div>
              )}
              {!editorLoaded && (
                <div className="h-60 border rounded-md flex items-center justify-center">
                  Loading editor...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorId">Author ID</Label>
                <Input
                  id="authorId"
                  name="authorId"
                  value={formData.authorId}
                  onChange={handleChange}
                  placeholder="Your unique ID"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">Cover Image URL</Label>
              <Input
                id="featuredImage"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-sm text-gray-500">Separate tags with commas</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Blog Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
