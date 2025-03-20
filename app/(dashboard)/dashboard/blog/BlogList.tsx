import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getBlogPosts } from '@/controllers/BlogController';
import Link from 'next/link';
import Image from 'next/image';

interface BlogListProps {
    limit?: number;
    offset?: number;
}

const BlogList: React.FC<BlogListProps> = async ({ limit = 25, offset = 0 }) => {
  const blogPosts = await getBlogPosts(limit, offset);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogPosts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            {post.featuredImage && (
                <Image
                    src={post.featuredImage} // Replace with actual image URL from Appwrite
                    alt={post.title}
                    width={400}
                    height={200}
                    className="rounded-t-lg object-cover"
                />
            )}
            <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
            <CardDescription>{post.excerpt || "No excerpt available"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
              <Link href={`/dashboard/blog/${post.id}`}>
                <Button variant="ghost" size="sm" className="text-brand-purple hover:text-brand-purple/90">
                  Read more <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlogList;
