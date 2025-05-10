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
  
}

/**
 * Represents the structure of the JWT authentication response from the backend.
 * Matches the backend JwtAuthenticationResponse DTO.
 */
export interface JwtAuthenticationResponse {
  accessToken: string;
  tokenType?: string; 
  
  
}

/**
 * Represents the structure of a generic API error response from the backend.
 */
export interface ApiErrorResponse {
  message: string;
  status?: number;      
  error?: string;       
  timestamp?: string;   
  path?: string;        
  details?: string[] | Record<string, string>; 
}


