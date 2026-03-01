export interface StudioSettings {
  name: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  updatedAt: string;
}

export interface UpdateStudioSettingsRequest {
  name?: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
