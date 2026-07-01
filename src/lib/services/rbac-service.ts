import { axiosClient } from "../axiosClient";

export interface TRole {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface TPermission {
  id: number;
  resource: string;
  action: string;
  description: string | null;
  createdAt: string;
}

export const RBACService = {
  getRoles: async (): Promise<TRole[]> => {
    const response = await axiosClient.get("/rbac/roles");
    return response.data.data;
  },

  createRole: async (data: {
    name: string;
    description: string | null;
  }): Promise<TRole> => {
    const response = await axiosClient.post("/rbac/roles", data);
    return response.data.data;
  },

  getPermissions: async (): Promise<TPermission[]> => {
    const response = await axiosClient.get("/rbac/permissions");
    return response.data.data;
  },

  createPermission: async (data: {
    resource: string;
    action: string;
    description: string | null;
  }): Promise<TPermission> => {
    const response = await axiosClient.post("/rbac/permissions", data);
    return response.data.data;
  },

  getRolePermissions: async (roleId: number): Promise<TPermission[]> => {
    const response = await axiosClient.get(`/rbac/roles/${roleId}/permissions`);
    return response.data.data;
  },

  assignPermissionToRole: async (
    roleId: number,
    permissionId: number,
  ): Promise<any> => {
    const response = await axiosClient.post(
      `/rbac/roles/${roleId}/permissions`,
      { permissionId },
    );
    return response.data;
  },

  unassignPermissionFromRole: async (
    roleId: number,
    permissionId: number,
  ): Promise<any> => {
    const response = await axiosClient.delete(
      `/rbac/roles/${roleId}/permissions/${permissionId}`,
    );
    return response.data;
  },

  // Invitations
  inviteUser: async (data: { email: string; roleName: string }) => {
    const response = await axiosClient.post("/auth/invite", data);
    return response.data;
  },
};
