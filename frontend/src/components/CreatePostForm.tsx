"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from 'next/navigation'; // For navigation
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { createBlogPost } from '@/lib/apiService'; // Import createBlogPost
import { CreatePostRequest } from '@/types'; // Import CreatePostRequest

// 1. Define the Zod schema for form validation
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long." }),
  // Author field removed as it will be determined by the backend via JWT
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePostForm() {
  const router = useRouter();
  // 2. Define the form using react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      
    },
  });

  // 3. Define the submit handler
  const { isAuthenticated, isLoading: authLoading } = useAuth(); // Get auth state

  // 3. Define the submit handler
  async function onSubmit(values: FormValues) {
    try {
      if (!isAuthenticated) {
        toast.error("You must be logged in to create a post.");
        // Optionally, redirect to login or disable form further up
        return;
      }
      const postData: CreatePostRequest = { title: values.title, content: values.content };
      const newPost = await createBlogPost(postData); // Use apiService
      toast.success("Blog post created successfully!");
      
      // Navigate to the new post's page or to the home page
      // router.push(`/posts/${newPost.id}`); // If backend returns the full new post with ID
      router.push("/"); // Or navigate to home page to see the new post in the list
      router.refresh(); // Refresh server components on the target page

    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error("Error creating post:", error);
    }
  }

  // 4. Build the form structure
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter post title" {...field} />
              </FormControl>
              <FormDescription>
                The main title of your blog post.
              </FormDescription>
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
                  placeholder="Write your blog post content here..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The main content of your blog post.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Author field removed */}
        <Button type="submit" disabled={form.formState.isSubmitting || !isAuthenticated || authLoading}>
          {form.formState.isSubmitting ? "Creating..." : "Create Post"}
        </Button>
      </form>
    </Form>
  );
}
