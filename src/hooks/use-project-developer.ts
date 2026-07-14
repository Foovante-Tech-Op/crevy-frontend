// src/hooks/use-project-developer.ts
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  completeProjectDeveloperProfile,
  type TCompleteProfilePayload,
} from "@/lib/services/project-developer-service";

/**
 * Completes the calling user's project_developer profile (bank/momo + farm
 * plot). On success, calls router.refresh() so the server-rendered session
 * (read in the dashboard layout server component) re-fetches with the new
 * `hasOnboarded: true` — a client-side authClient.getSession() call alone
 * would update better-auth's client cache but NOT the `user` prop threaded
 * down from the server component, so the banner wouldn't disappear.
 */
export function useCompleteProjectDeveloperProfile() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: TCompleteProfilePayload) =>
      completeProjectDeveloperProfile(payload),
    onSuccess: () => {
      toast.success("Profile completed. Welcome aboard!");
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't save your profile. Please try again.",
      );
    },
  });
}
