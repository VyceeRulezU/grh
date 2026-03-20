import { z } from 'zod';

export const ResourceSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  type: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  year: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  file_url: z.string().optional().nullable(),
}).passthrough();

export const CourseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  category: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
}).passthrough();

export const ProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
}).passthrough();
