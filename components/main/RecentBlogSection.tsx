"use client";

import { ArrowRight, User, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { getBlogPosts } from "@/controllers/BlogController";
import { Blog } from "@/lib/types/blog";


export default function RecentBlogSection() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async() => {
            setLoading(true);
            try{
                const posts = await getBlogPosts();
                // Map the Appwrite document objects to the Blog interface
                const typedPosts = posts.map((post) => ({
                    id: post.$id,
                    title: post.title,
                    content: post.content,
                    authorId: post.authorId,
                    authorName: post.authorName,
                    published: post.published,
                    createdAt: post.$createdAt,
                    updatedAt: post.$updatedAt,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    featuredImage: post.featuredImage,
                    tags: post.tags,
                    categories: post.categories
                }));
                setBlogs(typedPosts);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (error) {
        return <div>Error: {error}</div>;
    }


  return (
    <section className="px-4 py-10 md:px-6 lg:px-8 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[#C25934] font-medium mb-4 block"
          >
            BLOGS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Read Our Latest Tips & Tricks
          </motion.h2>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center items-center gap-3"
          >
            <span className="h-[2px] w-8 bg-[#C25934]" />
            <span className="h-1 w-2 bg-[#C25934] rounded-full" />
            <span className="h-[2px] w-8 bg-[#C25934]" />
          </motion.div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
              className="group bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={blog.featuredImage || "/placeholder.svg?height=400&width=600"}
                  alt={blog.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-medium text-[#C25934]">
                    {/*  blog.category  Replace with tag/category display logic */}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#C25934] transition-colors line-clamp-2">
                    <Link href={`/blog/${blog.id}`}>
                        {blog.title}
                    </Link>
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">{blog.excerpt}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>{blog.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{/* Add estimated reading time logic here */}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link href={`/blog/${blog.id}`} legacyBehavior>
                    <a className="flex items-center justify-between w-full text-[#C25934] font-medium group-hover:gap-6 gap-2 transition-all duration-300">
                        <span>Learn More</span>
                        <ArrowRight className="w-5 h-5" />
                    </a>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
