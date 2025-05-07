// src/app/posts/new/page.tsx
import CreatePostForm from "@/components/CreatePostForm";

export default function NewPostPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Create New Post</h1>
      <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg dark:bg-gray-800 dark:border dark:border-gray-700">
        <CreatePostForm />
      </div>
    </main>
  );
}
