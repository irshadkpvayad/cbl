import { z } from "zod";

const optionalText = z.string().trim().max(5000).optional().default("");
const tags = z.array(z.string().trim().min(1).max(32)).max(12).optional().default([]);

export const postPayload = z.object({
  body: z.object({
    title: z.string().trim().min(4).max(160),
    subtitle: z.string().trim().max(260).optional().default(""),
    thumbnail: z.string().url().optional().or(z.literal("")).default(""),
    content: z.string().min(20),
    categoryId: z.string().trim().min(1),
    category: z.string().trim().min(1),
    subcategoryId: z.string().trim().optional().default(""),
    subcategory: z.string().trim().optional().default(""),
    tags,
    status: z.enum(["draft", "published", "scheduled"]).optional().default("published"),
    featured: z.boolean().optional().default(false),
    pinned: z.boolean().optional().default(false),
    scheduledAt: z.string().datetime().optional()
  })
});

export const requestPayload = z.object({
  body: postPayload.shape.body.omit({ status: true, featured: true, pinned: true, scheduledAt: true }).extend({
    shortDescription: z.string().trim().min(10).max(320)
  })
});

export const categoryPayload = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    description: optionalText,
    image: z.string().url().optional().or(z.literal("")).default(""),
    icon: z.string().trim().max(80).optional().default("")
  })
});

export const subcategoryPayload = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    categoryId: z.string().trim().min(1),
    categoryName: z.string().trim().min(1),
    description: optionalText
  })
});

export const commentPayload = z.object({
  body: z.object({
    postId: z.string().trim().min(1),
    parentId: z.string().trim().optional().default(""),
    content: z.string().trim().min(1).max(3000),
    mentions: z.array(z.string().trim()).max(15).optional().default([])
  })
});

export const profilePayload = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(90).optional(),
    bio: z.string().trim().max(500).optional(),
    socialLinks: z
      .object({
        website: z.string().url().optional().or(z.literal("")),
        x: z.string().url().optional().or(z.literal("")),
        github: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal(""))
      })
      .optional()
  })
});
