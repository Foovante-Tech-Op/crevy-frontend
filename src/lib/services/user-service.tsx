// src/lib/services/user-service.tsx
import type { TUserRegistrationInput } from "@/types/user.types";
import { axiosClient } from "../axiosClient";

export const UserService = {
  /**
   * Register a new user via the v2 backend.
   *
   * Sends only the fields the v2 schema accepts.
   * The backend assigns super_admin role automatically — no userType or roleId needed.
   */
  registerUser: async (data: TUserRegistrationInput) => {
    // Build a clean payload — never forward confirmPassword to the API
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      contactNumber: data.contactNumber || undefined,
      countryOfOperation: data.countryOfOperation || undefined,
    };

    try {
      const response = await axiosClient.post("/auth/register", payload);
      return response.data;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  updateUserProfile: async (data: Partial<TUserRegistrationInput>) => {
    try {
      const response = await axiosClient.put("/users", data);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  getUserProfile: async (userId: string) => {
    try {
      const response = await axiosClient.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  },

  deleteUserProfile: async (userId: string) => {
    try {
      const response = await axiosClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user profile:", error);
      throw error;
    }
  },

  listUsers: async (filter?: { role?: string; organizationId?: string }) => {
    try {
      const response = await axiosClient.get("/rbac/users", { params: filter });
      return response.data;
    } catch (error) {
      console.error("Error listing users:", error);
      throw error;
    }
  },
};
