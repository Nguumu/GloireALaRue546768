import { z } from "zod";
import { CARD_CONDITIONS } from "@tcg/types";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "3 caractères minimum")
  .max(24, "24 caractères maximum")
  .regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et underscores uniquement");

export const emailSchema = z.string().trim().email("Adresse email invalide");

export const passwordSchema = z.string().min(8, "8 caractères minimum");

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const cardConditionSchema = z.enum(CARD_CONDITIONS);

export const collectionEntryInputSchema = z.object({
  cardPrintingId: z.string().uuid(),
  quantity: z.number().int().min(0).default(1),
  keepQuantity: z.number().int().min(0).default(1),
  condition: cardConditionSchema.default("NEAR_MINT"),
  purchasePriceMinor: z.number().int().min(0).nullable().optional(),
  purchaseDate: z.string().date().nullable().optional(),
  storageLocationId: z.string().uuid().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
  availableForTrade: z.boolean().default(false),
});
export type CollectionEntryInput = z.infer<typeof collectionEntryInputSchema>;

export const cardSearchQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  gameCode: z.string().optional(),
  setCode: z.string().optional(),
  colors: z.array(z.string()).optional(),
  rarity: z.string().optional(),
  category: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(24),
});
export type CardSearchQuery = z.infer<typeof cardSearchQuerySchema>;
