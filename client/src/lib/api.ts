/* eslint-disable @typescript-eslint/no-explicit-any */
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const INTERNAL_API_URL = process.env.NEXT_PRIVATE_API_URL ?? API_URL;

if (!API_URL) {
  throw Error("❌ Api url is not defined.");
}

export class Api {
  private baseUrl?: string;
  private accessToken?: string;

  constructor(baseUrl?: string, accessToken?: string) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  public setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  public async get<R>(url: string, params?: URLSearchParams): Promise<R> {
    url = !params ? url : `${url}?${params?.toString()}`;

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "GET",
      headers: {
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
      },
    });
    const data = await response.json();

    this.handleError(response, data);
    return data;
  }

  public async post<R, B = unknown>(url: string, body: B): Promise<R> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    this.handleError(response, data);
    return data;
  }

  public async put<R, B = any>(url: string, body: B): Promise<R> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    this.handleError(response, data);
    return data;
  }

  public async delete<R, B = any>(url: string, body?: B): Promise<R> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "DELETE",
      headers: {
        ...(body && {
          "Content-Type": "application/json",
        }),
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });
    const data = await response.json();

    this.handleError(response, data);
    return data;
  }

  private handleError(response: Response, data?: any) {
    if (!response.ok) {
      switch (response.status) {
        case HttpStatus.BadRequest:
          throw new ApiBadRequestError(data?.message, data?.detail);
        case HttpStatus.Unauthorized:
          throw new ApiUnauthorizedError(data?.message, data?.detail);
        case HttpStatus.Forbidden:
          throw new ApiForbiddenError(data?.message, data?.detail);
        
        // ADDED: Handle 422 Unprocessable Entity for validation errors
        case HttpStatus.UnprocessableEntity:
          throw new ApiUnprocessableEntityError(data?.detail, data?.detail); // Using detail for Pydantic errors

        case HttpStatus.InternalServerError:
          throw new ApiInternalServerError(data?.message, data?.detail);
        default:
          throw new ApiError("An unexpected error occurred. ( client/src/lib/api.ts )", undefined);
      }
    }
  }
}

export const HttpStatus = {
  Ok: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  UnprocessableEntity: 422, // ADDED: Status code for validation errors
  InternalServerError: 500,
};

export type ApiResponse = {
  message: string;
  detail?: any; // Changed to 'any' to handle different error structures
};

export class ApiError extends Error {
  detail?: any;

  constructor(message: string, detail?: any) {
    super(message);
    this.detail = detail;
  }
}

export class ApiBadRequestError extends ApiError {}
export class ApiUnauthorizedError extends ApiError {}
export class ApiForbiddenError extends ApiError {}
export class ApiUnprocessableEntityError extends ApiError {} // ADDED: New error class
export class ApiInternalServerError extends ApiError {}