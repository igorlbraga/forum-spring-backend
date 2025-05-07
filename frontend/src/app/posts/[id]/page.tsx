// This will be the page for displaying a single blog post
import { BlogPost } from "@/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SinglePostPageProps {
  params: {
    id: string;
  };
}

async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`http://localhost:8080/api/posts/${id}`,
      {
        cache: "no-store", // For fresh data
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Post not found
      }
      // For other errors, log and treat as not found for simplicity here
      console.error(`Failed to fetch post ${id}. Status: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
}

export default async function SinglePostPage({ params }: SinglePostPageProps) {
  const post = await getBlogPostById(params.id);

  if (!post) {
    notFound(); // This will render the nearest not-found.tsx or a default Next.js 404 page
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block">
        &larr; Back to All Posts
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">{post.title}</CardTitle>
          {post.author && (
            <CardDescription>By: {post.author}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Published: {new Date(post.publicationDate).toLocaleDateString()}
          </p>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {post.content}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
