import { LoginRequest, JwtAuthenticationResponse, ApiErrorResponse, RegisterRequest } from '@/types/auth';
import { BlogPost, CreatePostRequest, UpdatePostRequest } from '@/types/index'; // Import blog post types

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'; // Define your API base URL

// --- Helper for Authenticated API Calls ---
async function authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('authToken');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default Content-Type for methods that typically have a body, if not already set
  if (options.body && !headers.has('Content-Type') && 
      (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
    headers.set('Content-Type', 'application/json');
  }

  options.headers = headers;

  return fetch(`${API_BASE_URL}${endpoint}`, options);
}

// ApiErrorResponse is now imported from @/types/auth and used directly.

export async function loginUser(credentials: LoginRequest): Promise<JwtAuthenticationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    // Attempt to parse a more specific error message from the backend
    const errorData = data as ApiErrorResponse;
    throw new Error(errorData.message || `Login failed with status: ${response.status}`);
  }

  return data as JwtAuthenticationResponse;
}

export async function registerUser(userData: RegisterRequest): Promise<any> { // Adjust Promise<any> to a more specific type if your backend returns a body on successful registration, e.g., JwtAuthenticationResponse or a success message
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({})); // Try to parse JSON, default to empty object if no body or not JSON

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
  }

  // If your backend returns the JWT directly upon registration, you can use JwtAuthenticationResponse
  // Otherwise, if it returns a simple success message (e.g., 201 Created with no body or a simple message), adjust accordingly.
  // For now, assuming it might return JWT or just a success status.
  return data; 
}

// --- Blog Post API Functions ---

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  // Public endpoint, direct fetch is fine, or use authenticatedFetch if you want to always send token
  const response = await fetch(`${API_BASE_URL}/api/posts`); 
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as ApiErrorResponse;
    throw new Error(errorData.message || `Failed to fetch posts: ${response.status}`);
  }
  return response.json() as Promise<BlogPost[]>;
}

export async function getBlogPostById(postId: number): Promise<BlogPost> {
  // Public endpoint
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as ApiErrorResponse;
    throw new Error(errorData.message || `Failed to fetch post ${postId}: ${response.status}`);
  }
  return response.json() as Promise<BlogPost>;
}

export async function createBlogPost(postData: CreatePostRequest): Promise<BlogPost> {
  const response = await authenticatedFetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorDetails = responseData as ApiErrorResponse;
    throw new Error(errorDetails.message || `Failed to create post: ${response.status}`);
  }
  return responseData as BlogPost;
}

export async function deleteBlogPost(postId: number): Promise<void> {
  const response = await authenticatedFetch(`/api/posts/${postId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    // DELETE might return 204 No Content on success, which means .json() will fail.
    // Or it might return an error object if failed.
    let errorDetails: ApiErrorResponse | null = null;
    try {
      errorDetails = await response.json();
    } catch (e) {
      // Ignore if parsing fails (e.g. for 204 No Content)
    }
    throw new Error(errorDetails?.message || `Failed to delete post ${postId}: ${response.status}`);
  }
  // No return needed for a successful delete (often 204 No Content)
}

export async function updateBlogPost(postId: number, postData: UpdatePostRequest): Promise<BlogPost> {
  const response = await authenticatedFetch(`/api/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });

  const responseData = await response.json().catch(() => ({})); // Handle cases where response might not be JSON

  if (!response.ok) {
    const errorDetails = responseData as ApiErrorResponse;
    throw new Error(errorDetails.message || `Failed to update post ${postId}: ${response.status}`);
  }
  return responseData as BlogPost;
}

/**
 * Types like LoginRequest, RegisterRequest, JwtAuthenticationResponse 
 * are now defined in src/types/auth.ts
 */
