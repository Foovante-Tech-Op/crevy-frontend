import { toast } from "sonner";

/**
 * The delivery half of an invite response.
 *
 * Every endpoint that mints an invitation or a claim code now reports these
 * two things separately from its own success: the row was created (that's the
 * 201), and the email either went out or did not. They are genuinely
 * different outcomes and used to be collapsed into one.
 *
 * The reason that mattered: the API short-circuits every send when the mail
 * provider is unconfigured and still answers 201, so "Invite sent to
 * someone@example.com" was printed for invites where nothing ever left the
 * server. A field agent who never received anything, and an admin who was
 * told it was sent, is not a state anyone can debug from either end.
 */
export type TInviteDelivery = {
  emailSent?: boolean;
  emailError?: string;
};

/**
 * Report an invite outcome truthfully.
 *
 * `emailSent === false` is a warning, not an error: the invitation exists and
 * the token in it is valid, so the operator's next step is to pass the link
 * along by hand or fix the mail provider — not to retry, and certainly not to
 * assume nothing happened. `emailSent` being absent means an older API build
 * that doesn't report delivery, which is treated as sent so this never
 * regresses a working deploy into a permanent warning.
 */
export function notifyInviteResult(
  delivery: TInviteDelivery | undefined,
  sentMessage: string,
) {
  const delivered = delivery?.emailSent !== false;

  if (delivered) {
    toast.success(sentMessage);
    return;
  }

  toast.warning("Created, but no email was sent", {
    description:
      delivery?.emailError ??
      "The invitation is valid — share the setup link directly, or ask an admin to configure email delivery.",
    duration: 10_000,
  });
}
