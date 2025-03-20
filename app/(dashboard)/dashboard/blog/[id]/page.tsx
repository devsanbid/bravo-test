import { getBlogPostById, getBlogPosts } from "@/controllers/BlogController";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogPostPageProps {
  params: {
    id: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostById(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container px-4 py-8">
      <Link href="/dashboard/blog">
        <Button variant="ghost" className="mb-6 ml-10 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Button>
      </Link>
      <article className="max-w-3xl ml-14">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {post.categories && post.categories.map((category: string) => (
              <Badge key={category} className="mr-2">
                {category}
              </Badge>
            ))}
            <span className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">{post.excerpt}</p>
          <p className="text-sm text-gray-600 mb-4">By {post.authorName}</p>

        </header>

        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const blogPosts = await getBlogPosts(undefined, undefined, true);
  console.log(blogPosts)
  return blogPosts.map((post) => ({
    id: post.id,
  }));
}
