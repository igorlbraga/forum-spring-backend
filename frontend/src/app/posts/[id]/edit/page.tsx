'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getBlogPostById, updateBlogPost } from '@/lib/apiService';
import { UpdatePostRequest, BlogPost } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner'; // Or your preferred toast library
import Link from 'next/link';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
});

type EditPostFormValues = z.infer<typeof formSchema>;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = parseInt(params.id as string, 10);

  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);


  const form = useForm<EditPostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (isNaN(postId)) {
      setError("Invalid post ID.");
      setLoading(false);
      setIsAuthorized(false);
      return;
    }

    if (authLoading) { // Wait for authentication to resolve
        return;
    }

    if (!isAuthenticated) {
        setError("You must be logged in to edit a post.");
        setLoading(false);
        setIsAuthorized(false);
        // router.push('/login'); // Optional: redirect to login
        return;
    }

    const fetchPostAndCheckAuth = async () => {
      try {
        setLoading(true);
        const fetchedPost = await getBlogPostById(postId);
        setPost(fetchedPost);
        
        if (authUser && fetchedPost.author && authUser.username === fetchedPost.author.username) {
          form.reset({ title: fetchedPost.title, content: fetchedPost.content });
          setIsAuthorized(true);
        } else {
          setError("You are not authorized to edit this post.");
          setIsAuthorized(false);
        }
      } catch (err: any) {
        console.error("Failed to fetch post:", err);
        setError(err.message || 'Could not fetch the post for editing.');
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndCheckAuth();
  }, [postId, form, authUser, isAuthenticated, authLoading, router]);

  async function onSubmit(values: EditPostFormValues) {
    if (!isAuthorized || !post) {
        toast.error("Cannot update post. Not authorized or post data missing.");
        return;
    }
    setIsUpdating(true);
    setError(null);
    try {
      const updatedPostData: UpdatePostRequest = {
        title: values.title,
        content: values.content,
      };
      await updateBlogPost(post.id, updatedPostData);
      toast.success("Post updated successfully!");
      router.push(`/posts/${post.id}`); // Redirect to the updated post page
    } catch (err: any) {
      console.error("Failed to update post:", err);
      const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
      setError(errorMessage);
      toast.error(`Error updating post: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading || authLoading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  if (!isAuthenticated) { // Should be caught by useEffect, but as a fallback
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">You must be logged in to edit posts.</p>
        <Link href="/login" className="text-blue-500 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    );
  }
  
  if (error && !isAuthorized) { // If there was an error AND they are not authorized
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Error: {error}</p>
        <Link href={`/posts/${postId}`} className="text-blue-500 hover:underline mt-2 inline-block">Back to Post</Link>
        <br />
        <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">Back to Home</Link>
      </div>
    );
  }

  if (!isAuthorized && !loading) { // Explicitly not authorized after loading and auth check
    return (
        <div className="container mx-auto p-4 text-center">
            <p className="text-red-500">You are not authorized to edit this post.</p>
            <Link href={`/posts/${postId}`} className="text-blue-500 hover:underline mt-2 inline-block">Back to Post</Link>
            <br />
            <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">Back to Home</Link>
        </div>
    );
  }
  
  if (!post) { // Should not happen if authorized, but as a safeguard
    return <div className="container mx-auto p-4 text-center">Post data not available.</div>;
  }

  return (
    <main className="container mx-auto p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
          <CardDescription>Update the title and content of your post.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} />
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
                      <Textarea
                        placeholder="Write your post content here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && !isAuthorized && <p className="text-sm font-medium text-destructive">{error}</p>}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating || !isAuthorized || !form.formState.isDirty}>
                  {isUpdating ? 'Updating...' : 'Update Post'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}

