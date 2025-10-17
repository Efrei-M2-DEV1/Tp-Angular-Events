export interface User {
  id?: number;                    // ? = optionnel
  name: string;                   // obligatoire
  email: string;                  // obligatoire
  password?: string;              // optionnel (on ne le renvoie pas toujours)
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