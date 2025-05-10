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
import { useRouter } from 'next/navigation'; 
import { useAuth } from '@/contexts/AuthContext'; 
import { createBlogPost } from '@/lib/apiService'; 
import { CreatePostRequest } from '@/types'; 


const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long." }),
  
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePostForm() {
  const router = useRouter();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      
    },
  });

  
  const { isAuthenticated, isLoading: authLoading } = useAuth(); 

  
  async function onSubmit(values: FormValues) {
    try {
      if (!isAuthenticated) {
        toast.error("You must be logged in to create a post.");
        
        return;
      }
      const postData: CreatePostRequest = { title: values.title, content: values.content };
      const newPost = await createBlogPost(postData); 
      toast.success("Blog post created successfully!");
      
      
      
      router.push("/"); 
      router.refresh(); 

    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error("Error creating post:", error);
    }
  }

  
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
