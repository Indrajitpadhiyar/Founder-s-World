import { z } from "zod";

export const createBusinessSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Business name is required" })
      .min(3, "Business name must be at least 3 characters")
      .max(50, "Business name cannot exceed 50 characters"),
    category: z.enum(
      ["retail", "tech", "agriculture", "manufacturing", "energy"],
      {
        errorMap: () => ({ message: "Invalid business category" }),
      },
    ),
  }),
});
