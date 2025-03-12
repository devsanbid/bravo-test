import { getBlogPosts } from "@/controllers/BlogController";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


export default async function ModBlogPage() {
    const blogPosts = await getBlogPosts();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Manage Blog Posts</h1>
            <div className="mb-4">
                <Link href="/mod/blog/create">
                    <Button>Create New Blog Post</Button>
                </Link>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {blogPosts.map((post) => (
                        <TableRow key={post.id}>
                            <TableCell>{post.title}</TableCell>
                            <TableCell>{post.authorName}</TableCell>
                            <TableCell>
                                {post.published ? (
                                    <Badge variant="secondary">Published</Badge>
                                ) : (
                                    <Badge variant="secondary">Draft</Badge>
                                )}
                            </TableCell>
                            <TableCell>{post.createdAt}</TableCell>
                            <TableCell>
                                <Link href={`/mod/blog/${post.id}/edit`}>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </Link>
                                {/*  TODO: Add delete functionality with confirmation */}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
