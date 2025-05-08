import { BlogPost } from "@/types";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/apiService"; // Import from apiService
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  let posts: BlogPost[] = [];
  let error: string | null = null;

  try {
    const fetchedPosts = await getAllBlogPosts(); // Use the imported function
    // Sort posts by publication date (newest first)
    posts = fetchedPosts.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
  } catch (e: any) {
    console.error("Failed to load posts for HomePage:", e);
    error = e.message || "Could not fetch blog posts.";
    // posts will remain an empty array
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Blog Posts</h1>
      
      {error && (
        <p className="text-center text-red-500">Error loading posts: {error}</p>
      )}

      {!error && posts.length === 0 && (
        <p className="text-center text-gray-500">No blog posts found. Try creating some!</p>
      )}

      {!error && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <Link href={`/posts/${post.id}`} className="hover:underline" passHref>
                    <CardTitle>{post.title}</CardTitle>
                </Link>
                {post.author && (
                  <CardDescription>By: {post.author.username}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 mb-2">
                  Published: {new Date(post.publicationDate).toLocaleDateString()}
                </p>
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
