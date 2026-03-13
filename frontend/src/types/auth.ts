export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
