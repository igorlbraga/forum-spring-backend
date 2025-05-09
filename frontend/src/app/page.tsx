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
import { User, CalendarDays, MessageCircle } from 'lucide-react'; // Importar ícones

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
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <Link href={`/posts/${post.id}`} className="hover:underline" passHref>
                  <CardTitle className="text-lg font-semibold">{post.title}</CardTitle>
                </Link>
                {/* Preview do conteúdo */}
                <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                  {post.content}
                </p>
              </CardHeader>
              <CardContent className="pt-2 text-sm text-gray-600">
                <div className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
                  <span className="flex items-center">
                    <User className="mr-1 h-4 w-4 text-gray-500" />
                    {post.author ? post.author.username : 'Autor desconhecido'}
                  </span>
                  <span className="flex items-center">
                    <CalendarDays className="mr-1 h-4 w-4 text-gray-500" />
                    {new Date(post.publicationDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center text-gray-500">
                    <MessageCircle className="mr-1 h-4 w-4" />
                    0 Respostas {/* Placeholder */}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
