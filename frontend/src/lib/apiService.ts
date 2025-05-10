import { LoginRequest, JwtAuthenticationResponse, ApiErrorResponse, RegisterRequest } from '@/types/auth';
import { BlogPost, CreatePostRequest, UpdatePostRequest, Comment } from '@/types/index'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'; 


async function authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('authToken');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  
  if (options.body && !headers.has('Content-Type') && 
      (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
    headers.set('Content-Type', 'application/json');
  }

  options.headers = headers;

  return fetch(`${API_BASE_URL}${endpoint}`, options);
}



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
    
    const errorData = data as ApiErrorResponse;
    throw new Error(errorData.message || `Login failed with status: ${response.status}`);
  }

  return data as JwtAuthenticationResponse;
}

export async function registerUser(userData: RegisterRequest): Promise<any> { 
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({})); 

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
  }

  
  
  
  return data; 
}



export async function getAllBlogPosts(): Promise<BlogPost[]> {
  
  const response = await fetch(`${API_BASE_URL}/api/posts`); 
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as ApiErrorResponse;
    console.error("Error fetching posts:", errorData);
    throw new Error(errorData.message || `Failed to fetch posts: ${response.status}`);
  }
  return response.json() as Promise<BlogPost[]>;
}

export async function getBlogPostById(postId: number): Promise<BlogPost> {
  
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
    
    
    let errorDetails: ApiErrorResponse | null = null;
    try {
      errorDetails = await response.json();
    } catch (e) {
      
    }
    throw new Error(errorDetails?.message || `Failed to delete post ${postId}: ${response.status}`);
  }
  
}

export async function updateBlogPost(postId: number, postData: UpdatePostRequest): Promise<BlogPost> {
  const response = await authenticatedFetch(`/api/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });

  const responseData = await response.json().catch(() => ({})); 

  if (!response.ok) {
    const errorDetails = responseData as ApiErrorResponse;
    throw new Error(errorDetails.message || `Failed to update post ${postId}: ${response.status}`);
  }
  return responseData as BlogPost;
}



export async function getComments(postId: number): Promise<Comment[]> {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as ApiErrorResponse;
    throw new Error(errorData.message || `Failed to fetch comments for post ${postId}: ${response.status}`);
  }
  return response.json() as Promise<Comment[]>;
}

export async function createComment(postId: number, commentData: { content: string }): Promise<Comment> {
  const response = await authenticatedFetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorDetails = responseData as ApiErrorResponse;
    throw new Error(errorDetails.message || `Failed to create comment for post ${postId}: ${response.status}`);
  }
  return responseData as Comment;
}

export async function deleteComment(commentId: number): Promise<void> {
  const response = await authenticatedFetch(`/api/comments/${commentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorDetails: ApiErrorResponse | null = null;
    try {
      errorDetails = await response.json();
    } catch (e) {
      
    }
    throw new Error(errorDetails?.message || `Failed to delete comment ${commentId}: ${response.status}`);
  }
  
}

export async function updateComment(commentId: number, commentData: { content: string }): Promise<Comment> {
  const response = await authenticatedFetch(`/api/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify(commentData),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorDetails = responseData as ApiErrorResponse;
    throw new Error(errorDetails.message || `Failed to update comment ${commentId}: ${response.status}`);
  }
  return responseData as Comment;
}


/**
 * Types like LoginRequest, RegisterRequest, JwtAuthenticationResponse 
 * are now defined in src/types/auth.ts
 */
