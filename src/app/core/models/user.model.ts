export interface User {
  id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Pour compatibilité avec les anciennes données
  role?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}