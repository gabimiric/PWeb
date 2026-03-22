import { defineCollection, z } from 'astro:content';

// Home page content
const homeCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    disclaimer: z.string(),
    stats: z.array(z.object({
      value: z.string(),
      label: z.string()
    })),
    features: z.array(z.object({
      emoji: z.string(),
      title: z.string(),
      description: z.string()
    })),
    ctaText: z.string()
  })
});

// Testimonials collection
const testimonialsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    quote: z.string(),
    author: z.string(),
    role: z.string(),
    stars: z.number().min(1).max(5)
  })
});

// Pricing tiers collection
const pricingCollection = defineCollection({
  type: 'data',
  schema: z.object({
    tier: z.string(),
    price: z.string(),
    features: z.array(z.string()),
    cta: z.string()
  })
});

// Team members collection
const teamCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    image: z.string().optional()
  })
});

// FAQ collection
const faqCollection = defineCollection({
  type: 'data',
  schema: z.object({
    question: z.string(),
    answer: z.string()
  })
});

export const collections = {
  home: homeCollection,
  testimonials: testimonialsCollection,
  pricing: pricingCollection,
  team: teamCollection,
  faq: faqCollection
};
