# Backend Implementation Guide for Email Verification & Onboarding

## Overview

This guide provides all backend changes needed to support the frontend email verification and project developer onboarding system.

---

## 1. Update User Model

**File: `src/v2/auth/models/auth.model.ts`**

Add these fields to the user table:

```typescript
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  // ... existing fields ...

  // Email verification fields
  isVerified: boolean("isVerified", { default: false }).notNull(),
  verificationToken: text("verificationToken"),
  verificationExpires: timestamp("verificationExpires", { mode: "date" }),

  // Project developer onboarding field
  hasOnboarded: boolean("hasOnboarded", { default: false }).notNull(),
});
```

**After updating the model, run:**

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

---

## 2. Create Email Service

**File: `src/lib/email/email.service.ts`**

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const result = await resend.emails.send({
      from: "Crevy <noreply@crevy.com>",
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

export function generateVerificationEmail(
  token: string,
  email: string,
): string {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Verify Your Email - Crevy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #000; text-decoration: none; font-weight: bold; border-radius: 4px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Verify Your Email Address</h1>
          <p>Thank you for registering with Crevy. Please click the button below to verify your email address:</p>
          <p>
            <a href="${verificationLink}" class="button">Verify Email</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationLink}</p>
          <p>This link will expire in 7 days.</p>
          <div class="footer">
            <p>If you didn't create an account with Crevy, you can safely ignore this email.</p>
            <p>© 2024 Crevy. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateWelcomeEmail(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to Crevy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Crevy, ${name}!</h1>
          <p>Your account has been created successfully. Please verify your email to get started.</p>
          <p>If you haven't already verified your email, please check your inbox for the verification link.</p>
          <div class="footer">
            <p>© 2024 Crevy. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
```

---

## 3. Create Verification Token Utility

**File: `src/lib/auth/verification-tokens.ts`**

```typescript
import { randomBytes } from "crypto";

export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

export function getVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // 7 days from now
  return expiry;
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
```

---

## 4. Create Rate Limiter

**File: `src/lib/rate-limiter.ts`**

```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record || now > record.resetAt) {
    // Create new record or reset expired one
    rateLimits.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false; // Rate limit exceeded
  }

  // Increment count
  record.count++;
  return true;
}

export function getRateLimitRemaining(key: string): number {
  const record = rateLimits.get(key);
  if (!record || Date.now() > record.resetAt) {
    return 3; // Default max attempts
  }
  return Math.max(0, 3 - record.count);
}
```

---

## 5. Create Email Verification Endpoints

**File: `src/v2/auth/routes/verification.routes.ts`**

```typescript
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  sendEmail,
  generateVerificationEmail,
} from "@/lib/email/email.service";
import {
  generateVerificationToken,
  getVerificationExpiry,
  isTokenExpired,
} from "@/lib/auth/verification-tokens";
import { checkRateLimit } from "@/lib/rate-limiter";
import { authMiddleware } from "@/v2/auth/middleware/auth.middleware";
import { db } from "@/db";
import { user } from "@/v2/auth/models/auth.model";

const verificationRoutes = new Hono();

// Verify email with token
verificationRoutes.get("/verify-email", async (c) => {
  try {
    const token = c.req.query("token");

    if (!token) {
      return c.json({ success: false, message: "Token is required" }, 400);
    }

    // Find user by token
    const [userRecord] = await db
      .select()
      .from(user)
      .where(eq(user.verificationToken, token))
      .limit(1);

    if (!userRecord) {
      return c.json(
        { success: false, message: "Invalid verification token" },
        400,
      );
    }

    // Check if token is expired
    if (isTokenExpired(userRecord.verificationExpires!)) {
      return c.json(
        {
          success: false,
          message: "Verification token has expired. Please request a new one.",
        },
        400,
      );
    }

    // Update user as verified
    await db
      .update(user)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      })
      .where(eq(user.id, userRecord.id));

    return c.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return c.json({ success: false, message: "Verification failed" }, 500);
  }
});

// Resend verification email
verificationRoutes.post(
  "/resend-verification",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
    }),
  ),
  async (c) => {
    try {
      const { email } = c.req.valid("json");

      // Rate limit: 3 attempts per hour
      const rateLimitKey = `resend-verification:${email}`;
      if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
        return c.json(
          {
            success: false,
            message: "Too many requests. Please try again in 1 hour.",
          },
          429,
        );
      }

      // Find user
      const [userRecord] = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (!userRecord) {
        return c.json({ success: false, message: "User not found" }, 404);
      }

      if (userRecord.isVerified) {
        return c.json(
          { success: false, message: "Email is already verified" },
          400,
        );
      }

      // Generate new token
      const token = generateVerificationToken();
      const expires = getVerificationExpiry();

      await db
        .update(user)
        .set({
          verificationToken: token,
          verificationExpires: expires,
        })
        .where(eq(user.id, userRecord.id));

      // Send verification email
      const html = generateVerificationEmail(token, email);
      await sendEmail({
        to: email,
        subject: "Verify Your Email Address - Crevy",
        html,
      });

      return c.json({
        success: true,
        message: "Verification email sent. Please check your inbox.",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      return c.json(
        { success: false, message: "Failed to send verification email" },
        500,
      );
    }
  },
);

// Change email (requires authentication)
verificationRoutes.post(
  "/change-email",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
    }),
  ),
  async (c) => {
    try {
      const { email } = c.req.valid("json");
      const session = c.get("session");
      const userId = session.user.id;

      // Check if email already exists
      const [existingUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (existingUser) {
        return c.json({ success: false, message: "Email already in use" }, 400);
      }

      // Generate new verification token
      const token = generateVerificationToken();
      const expires = getVerificationExpiry();

      // Update email and reset verification
      await db
        .update(user)
        .set({
          email,
          isVerified: false,
          verificationToken: token,
          verificationExpires: expires,
        })
        .where(eq(user.id, userId));

      // Send verification email
      const html = generateVerificationEmail(token, email);
      await sendEmail({
        to: email,
        subject: "Verify Your New Email Address - Crevy",
        html,
      });

      return c.json({
        success: true,
        message: "Email updated! Please check your new inbox to verify.",
      });
    } catch (error) {
      console.error("Change email error:", error);
      return c.json({ success: false, message: "Failed to update email" }, 500);
    }
  },
);

export { verificationRoutes };
```

---

## 6. Update Registration Service

**File: `src/v2/auth/services/registration.service.ts`**

```typescript
import { sendEmail, generateWelcomeEmail } from "@/lib/email/email.service";
import {
  generateVerificationToken,
  getVerificationExpiry,
} from "@/lib/auth/verification-tokens";

export class RegistrationService {
  // ... existing methods ...

  async completeRegistration(userId: string, data: TCompleteRegistration) {
    // ... existing logic ...

    // Generate verification token
    const token = generateVerificationToken();
    const expires = getVerificationExpiry();

    // Update user with verification token
    await db
      .update(user)
      .set({
        isVerified: false,
        verificationToken: token,
        verificationExpires: expires,
      })
      .where(eq(user.id, userId));

    // Send welcome email
    const welcomeHtml = generateWelcomeEmail(
      `${data.firstName} ${data.lastName}`,
    );
    await sendEmail({
      to: data.email,
      subject: "Welcome to Crevy!",
      html: welcomeHtml,
    });

    // Send verification email
    const verificationHtml = generateVerificationEmail(token, data.email);
    await sendEmail({
      to: data.email,
      subject: "Verify Your Email Address - Crevy",
      html: verificationHtml,
    });

    return { success: true, message: "Registration successful" };
  }
}
```
