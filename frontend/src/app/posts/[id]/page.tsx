'use client'; 

import { BlogPost, User } from "@/types"; 
import Link from "next/link";
import { getBlogPostById, deleteBlogPost } from "@/lib/apiService"; 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";


import CommentSection from '@/components/CommentSection'; 



export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser, isAuthenticated, isAdmin } = useAuth(); 
  
  const postIdFromParams = params?.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  

  useEffect(() => {
    if (postIdFromParams) {
      const numericId = parseInt(postIdFromParams, 10);
      if (isNaN(numericId)) {
        setError("Invalid post ID format.");
        setLoading(false);
        return;
      }

      const fetchPost = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const fetchedPost = await getBlogPostById(numericId);
          setPost(fetchedPost);
          
        } catch (err: any) {
          console.error(`Failed to fetch post ${numericId}:`, err);
          if (err.message.includes("404") || (err.response && err.response.status === 404)) {
            setError("Post not found."); 
          } else {
            setError(err.message || 'Could not fetch the blog post.');
          }
          setPost(null);
        }
        setLoading(false);
        
      };
      fetchPost();
    }
  }, [postIdFromParams]);

  const handleDelete = async () => {
    if (!post || !post.id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBlogPost(post.id);
      
      router.push('/'); 
    } catch (err: any) {
      console.error(`Failed to delete post ${post.id}:`, err);
      setDeleteError(err.message || 'Could not delete the post.');
      setIsDeleting(false);
    }
    
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading post...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Error: {error}</p>
        <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          &larr; Back to All Posts
        </Link>
      </div>
    );
  }

  if (!post) {
    
    
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Post not found or ID is invalid.</p>
        <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          &larr; Back to All Posts
        </Link>
      </div>
    );
  }

  
  const isOwnerOrAdmin = isAuthenticated && authUser && post.author && (authUser.username === post.author.username || isAdmin);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Back to All Posts
        </Link>
        {/* Show Edit/Delete buttons only if user is authenticated and is the author OR is an admin */}
        {isOwnerOrAdmin && (
          <div className="mt-4 flex space-x-2">
            <Link href={`/posts/${post.id}/edit`} passHref>
              <Button variant="outline">Edit Post</Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Post'}
            </Button>
          </div>
        )}
      </div>
      {deleteError && (
        <p className="text-red-500 text-center mb-4">Error deleting post: {deleteError}</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">{post.title}</CardTitle>
          {post.author && (
            <CardDescription>By: {post.author.username}</CardDescription>
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

      {/* Render CommentSection if post and numericId are available */}
      {post && !isNaN(parseInt(postIdFromParams, 10)) && (
        <CommentSection postId={parseInt(postIdFromParams, 10)} />
      )}

    </main>
  );
}
