import { z } from 'zod';

export * from './auth';

export const contactSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export const subscriptionSchema = z.object({
  email: z.string().email(),
});

export const categorySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional().or(z.literal('')),
});

export const postSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  status: z.enum(['0', '1']),
  thumbnail: z.string().optional().or(z.literal('')),
  content: z.string().min(1),
  excerpt: z.string().min(1).max(500),
  tags: z.string().min(1),
});

export const eventSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  start: z.coerce.date(),
  end: z.coerce.date(),
  status: z.preprocess((v) => v === 'true' || v === true || v === '1', z.boolean()).default(false),
});

export const pageSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
  keywords: z.string().optional().or(z.literal('')),
  thumbnail: z.string().optional().or(z.literal('')),
  content: z.string().min(1),
  status: z.enum(['0', '1']),
});

export const faqSchema = z.object({
  question: z.string().min(1).max(255),
  answer: z.string().min(1).max(255),
});

export const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  photo: z.string().optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
});

export const sliderSchema = z.object({
  image: z.string().min(1),
  status: z.enum(['0', '1']).default('1'),
});

export const settingSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  coreValues: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  logo: z.string().optional(),
  fbLink: z.string().optional(),
  twLink: z.string().optional(),
  igLink: z.string().optional(),
  ytLink: z.string().optional(),
  maintenanceMode: z.preprocess((v) => v === 'true' || v === true || v === 'on', z.boolean()).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(3).max(50),
  phone: z.string().min(7),
  state: z.string().optional().or(z.literal('')),
  lga: z.string().optional().or(z.literal('')),
  ward: z.string().optional().or(z.literal('')),
  voter_card: z.string().min(1),
});

export const imageSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
});
