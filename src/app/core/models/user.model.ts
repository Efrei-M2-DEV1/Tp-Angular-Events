export interface User {
  id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}