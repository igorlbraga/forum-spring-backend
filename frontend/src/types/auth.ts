/**
 * Represents the payload for a login request.
 * Matches the backend LoginRequest DTO.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Represents the payload for a registration request.
 * Matches the backend RegisterRequest DTO.
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  // name?: string; // If you have a name field in your backend RegisterRequest
}

/**
 * Represents the structure of the JWT authentication response from the backend.
 * Matches the backend JwtAuthenticationResponse DTO.
 */
export interface JwtAuthenticationResponse {
  accessToken: string;
  tokenType?: string; // e.g., 'Bearer'
  // You might also include user details or roles here if your backend sends them
  // For example: user?: { id: string; username: string; email: string; roles: string[] };
}

/**
 * Represents the structure of a generic API error response from the backend.
 */
export interface ApiErrorResponse {
  message: string;
  status?: number;      // HTTP status code
  error?: string;       // General error description (e.g., "Bad Request", "Unauthorized")
  timestamp?: string;   // ISO date string
  path?: string;        // The API path that caused the error
  details?: string[] | Record<string, string>; // More specific error details, if provided by backend
}

// Add other auth-related type definitions here as needed.
