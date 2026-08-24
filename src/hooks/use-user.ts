import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { UserService } from "@/lib/services/user-service";
import type {
  TBetterAuthUser,
  TUserRegistrationInput,
} from "@/types/user.types";

export const useUser = () => {
  const { data: session, isPending, error } = authClient.useSession();

  return {
    user: session?.user as TBetterAuthUser | undefined,
    session,
    isPending,
    error,
    isAuthenticated: !!session,
  };
};

export const useGetUserProfile = (userId: string) => {
  return useQuery<any, Error, any>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const response = await UserService.getUserProfile(userId);
      return response;
    },
  });
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      const response = await UserService.registerUser(data);
      return response;
    },
    onSuccess: () => {
      toast.success("Account created.");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      console.error("Error registering user: ", error);
      toast.error(
        getErrorMessage(
          error,
          "We couldn't create that account. Please try again.",
        ),
      );
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<TUserRegistrationInput, Error, any>({
    mutationFn: async (data: Partial<TUserRegistrationInput>) => {
      const response = await UserService.updateUserProfile(data);
      return response;
    },
    onSuccess: () => {
      toast.success("Changes saved.");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      console.error("Error updating user profile: ", error);
      toast.error(
        getErrorMessage(
          error,
          "We couldn't save those changes. Please try again.",
        ),
      );
    },
  });
};

export const useDeleteUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: async (userId: string) => {
      const response = await UserService.deleteUserProfile(userId);
      return response;
    },
    onSuccess: () => {
      toast.success("Account deleted.");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      console.error("Error deleting user profile: ", error);
      toast.error(
        getErrorMessage(
          error,
          "We couldn't delete that account. Please try again.",
        ),
      );
    },
  });
};
