export interface User {
  id: number;
  username: string;
  password: string;
}

export interface BlogPost {
  id: number; 
  title: string;
  content: string;
  author: User | null;
  publicationDate: string; 
}

/**
 * Represents the payload for creating a new blog post.
 * Title and content are required.
 */
export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
}
