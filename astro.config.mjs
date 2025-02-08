import { defineConfig, sharpImageService } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://lutaonan.com',
  integrations: [tailwind()],
  image: {
    service: sharpImageService({ limitInputPixels: false })
  }
});