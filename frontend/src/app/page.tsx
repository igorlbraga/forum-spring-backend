import { BlogPost } from "@/types";
import Link from "next/link"; // Added Link import
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch("http://localhost:8080/api/posts", {
      cache: "no-store", // For Server Components, to ensure fresh data on each request
    });

    if (!response.ok) {
      console.error("Failed to fetch blog posts. Status:", response.status);
      return []; 
    }
    const posts: BlogPost[] = await response.json();
    return posts.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return []; 
  }
}

export default async function HomePage() {
  const posts = await getBlogPosts();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Blog Posts</h1>
      
      {posts.length === 0 && (
        <p className="text-center text-gray-500">No blog posts found. Try creating some!</p>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <Link href={`/posts/${post.id}`} passHref legacyBehavior>
                  <a className="hover:underline">
                    <CardTitle>{post.title}</CardTitle>
                  </a>
                </Link>
                {post.author && (
                  <CardDescription>By: {post.author}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 mb-2">
                  Published: {new Date(post.publicationDate).toLocaleDateString()}
                </p>
                {/* Limiting content preview on the main page for brevity */}
                <p className="text-gray-700 whitespace-pre-wrap truncate h-20 overflow-hidden">
                  {post.content}
                </p>
                <Link href={`/posts/${post.id}`} className="text-blue-500 hover:underline mt-2 inline-block">
                  Read more...
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
