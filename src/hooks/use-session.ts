import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth";

/**
 * Extended user type with custom fields from Crevy backend
 */
export interface CrevyUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  hasOnboarded?: boolean; // Project developer onboarding status
  role?: string | null;
  activeOrganizationId?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  firstName?: string;
  lastName?: string;
  contactNumber?: string | null;
  countryOfOperation?: string | null;
  roleId?: number | null;
  profileCompleted?: boolean | null;
}

export interface SessionData {
  user: CrevyUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface SessionState {
  data: SessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

/**
 * Hook to get the current user session with extended Crevy fields
 * Automatically refetches on window focus
 */
export function useSession() {
  const [state, setState] = useState<SessionState>({
    data: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const fetchSession = useCallback(async () => {
    try {
      const session = await authClient.getSession();

      if (session?.data?.user) {
        setState({
          data: session.data as SessionData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        setState({
          data: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        isAuthenticated: false,
        error: error as Error,
      });
    }
  }, []);

  useEffect(() => {
    fetchSession();

    // Refetch on window focus
    const handleFocus = () => {
      fetchSession();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchSession]);

  return state;
}

/**
 * Hook to check if the user needs to complete onboarding
 * Returns true if user is a project developer who hasn't onboarded
 */
export function useNeedsOnboarding(): boolean {
  const { data, isAuthenticated } = useSession();

  if (!isAuthenticated || !data?.user) {
    return false;
  }

  // Only project developers need onboarding
  // hasOnboarded is false for project developers who haven't completed profile
  return data.user.hasOnboarded === false;
}

/**
 * Hook to check if the user's email is verified
 * Returns true if verified, false if not, null if not authenticated
 */
export function useIsVerified(): boolean | null {
  const { data, isAuthenticated } = useSession();

  if (!isAuthenticated || !data?.user) {
    return null;
  }

  return data.user.emailVerified;
}

/**
 * Hook to get the current user
 * Returns null if not authenticated
 */
export function useUser(): CrevyUser | null {
  const { data, isAuthenticated } = useSession();

  if (!isAuthenticated || !data?.user) {
    return null;
  }

  return data.user;
}
