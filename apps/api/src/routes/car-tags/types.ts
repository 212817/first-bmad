// apps/api/src/routes/car-tags/types.ts

/**
 * Request body for creating a car tag
 */
export interface CreateCarTagRequest {
  name: string;
  color?: string;
}

/**
 * Request body for updating a car tag
 */
export interface UpdateCarTagRequest {
  name?: string;
  color?: string;
}

/**
 * Response for a car tag
 */
export interface CarTagResponse {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}
