export interface Comment {
  id: number;
  content: string;
  publicationDate: string; // Ou Date, dependendo de como for parseado
  authorUsername: string;
  authorId: number;
  postId: number;
}

export interface User {
  id: number;
  username: string;
  password: string;
}

export interface BlogPost {
  id: number; 
  title: string;
  content: string; // This might be a summary if we change the DTO further, but for now assume full content or handled by another field
  author: User | null; // Or a simpler AuthorSummary type
  publicationDate: string; 
  commentCount: number; // Added for summary
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
