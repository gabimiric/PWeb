import { defineConfig } from 'astro/config';

export default defineConfig({
  // Enable server-side rendering for Vercel deployment
  output: 'static',
  
  // Configure image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  // Configure integrations here if needed
  integrations: [],

  // Vercel-specific configuration
  vite: {
    ssr: {
      external: ['pico-css']
    }
  }
});
