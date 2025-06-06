import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return NextResponse.json(response);
}

export function errorResponse(message: string, status: number = 400): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: message
  };
  return NextResponse.json(response, { status });
}

export function notFoundResponse(message: string = "Resource not found"): NextResponse {
  return errorResponse(message, 404);
}

export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = "Forbidden"): NextResponse {
  return errorResponse(message, 403);
}

export function serverErrorResponse(message: string = "Internal server error"): NextResponse {
  return errorResponse(message, 500);
}

export function validateRequiredFields(data: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }
  return null;
} 