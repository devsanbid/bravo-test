"use client"
import { getBlogPostById, updateBlogPost } from "@/controllers/BlogController";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Blog } from "@/lib/types/blog";
import { useEffect, useState, useMemo } from "react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast";

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TipTapMenuBar } from "@/components/ui/TipTapMenuBar";
import Link from '@tiptap/extension-link'


interface EditBlogPageProps {
  params: {
    id: string;
  };
}

const EditBlogPage = async ({ params }: EditBlogPageProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const blog = await getBlogPostById(params.id);

  if (!blog) {
    notFound();
  }

    const editor = useEditor({
        extensions: [
        StarterKit,
        Link.configure({
            openOnClick: false,
          }),
        ],
        content: blog.content,
    })


  const form = useForm<Partial<Blog>>({
    defaultValues: {
      title: blog.title,
      excerpt: blog.excerpt,
      featuredImage: blog.featuredImage,
      tags: blog.tags,
      categories: blog.categories,
    },
  });

  async function onSubmit(values: Partial<Blog>) {
    setIsSaving(true);
    try {
        const updatedContent = editor?.getHTML()
        await updateBlogPost(params.id, {
            ...values,
            content: updatedContent
        });
      toast({
        title: "Success",
        description: "Blog post updated successfully!",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update blog post.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Edit Blog Post</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                    {/* <Textarea {...field} className="min-h-[200px]" /> */}
                    <div className="border rounded-md">
                        {editor && <TipTapMenuBar editor={editor} />}
                        <EditorContent editor={editor} />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="featuredImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma-separated)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories (comma-separated)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditBlogPage;
