import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  name?: string | null;
}

export interface AuthenticatedRequest extends Request {
  id?: string;
  user?: AuthenticatedUser;
  sessionId?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
