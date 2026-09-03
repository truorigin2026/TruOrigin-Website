# TruOrigin Website

A modern Next.js-based website for TruOrigin, built with React, TypeScript, and TailwindCSS. This project showcases product information, brand verification, and industry solutions.

## Project Overview

TruOrigin is a platform that provides authenticity verification and transparency solutions for brands and products. This website serves as the primary interface for customers, brands, and administrators to interact with the platform.

## Technology Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5.8.2
- **Styling**: TailwindCSS 4.1.3 with PostCSS
- **UI Library**: React 19.0.0
- **Animation**: Framer Motion 11.18.2
- **Package Manager**: npm

## Project Structure

The project follows a clean, organized folder structure designed for scalability and developer experience:

```
TruOrigin Website/
├── app/                          # Next.js App Router pages and layouts
│   ├── (main)/                   # Main marketing pages (about, contact, pricing, etc.)
│   │   ├── about/
│   │   ├── contact/
│   │   ├── faq/
│   │   ├── pricing/
│   │   └── ...
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── account/
│   ├── (admin)/                  # Admin dashboard pages
│   │   └── admin/
│   ├── (public)/                 # Public-facing pages (products, brands, blog, etc.)
│   │   ├── blog/
│   │   ├── brands/
│   │   ├── products/
│   │   ├── for-brands/
│   │   ├── for-products/
│   │   └── ...
│   ├── api/                      # API routes (if needed)
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Root page
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── ui/                       # Generic UI components
│   │   ├── feature-card.tsx
│   │   ├── product-card.tsx
│   │   ├── pill-button.tsx
│   │   └── ...
│   ├── common/                   # Layout components
│   │   ├── site-header.tsx
│   │   └── site-footer.tsx
│   ├── sections/                 # Section-specific components
│   │   ├── landing-sections.tsx
│   │   ├── page-hero.tsx
│   │   └── ...
│   ├── brands/                   # Brand-specific components
│   ├── products/                 # Product-specific components
│   └── ...
├── lib/                          # Utility functions and data
│   ├── data/                     # Static data files
│   │   ├── site-data.ts          # Product and catalog data
│   │   ├── brands-landing-data.ts # Brand page data
│   │   └── frontend-data.ts      # Frontend configuration
│   ├── utils/                    # Utility functions
│   └── hooks/                    # Custom React hooks
├── public/                       # Static assets
│   ├── images/                   # All images organized by category
│   │   ├── catalog/              # Product catalog images
│   │   ├── for-brands/           # Brand-related images
│   │   ├── logos/                # Logo files
│   │   ├── icons/                # Icon files
│   │   └── elements/             # UI elements
│   └── favicon.ico
├── types/                        # TypeScript type definitions
├── styles/                       # Global styles (if needed)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration
├── package.json                  # Project dependencies
├── package-lock.json             # Dependency lock file
└── README.md                     # This file

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "TruOrigin Website"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- **`npm run dev`**: Start the development server with hot-reload
- **`npm run build`**: Build the project for production
- **`npm start`**: Start the production server
- **`npm run lint`**: Run ESLint to check code quality

## Folder Organization Guide

### `app/` Directory

The `app` directory uses Next.js App Router with route groups for logical organization:

- **`(main)`**: Core marketing pages including about, contact, FAQ, and pricing
- **`(auth)`**: Authentication-related pages (login, signup, account management)
- **`(admin)`**: Admin dashboard and management pages
- **`(public)`**: Public-facing pages including products, brands, blog, and industry information
- **`api`**: Backend API routes (if applicable)

### `components/` Directory

Components are organized by type and purpose:

- **`ui/`**: Reusable, generic UI components (buttons, cards, badges, etc.)
- **`common/`**: Layout-specific components (header, footer)
- **`sections/`**: Large section components for pages
- **`brands/`** and **`products/`**: Domain-specific component groups

### `lib/` Directory

Utility code and static data:

- **`data/`**: Static data files used throughout the application
- **`utils/`**: Helper functions and utilities
- **`hooks/`**: Custom React hooks

### `public/` Directory

All static assets are organized under `public/images/`:

- **`catalog/`**: Product catalog images
- **`for-brands/`**: Images related to brand features and testimonials
- **`logos/`**: Brand and company logos
- **`icons/`**: SVG icons and icon-like images
- **`elements/`**: UI elements and decorative images

## Image Path Convention

All images are now served from the `public/images/` directory. When referencing images in components:

```tsx
// ✅ Correct
<img src="/images/products/product-name.jpg" alt="Product" />
<Image src="/images/logos/truorigin-logo.png" alt="Logo" />

// ❌ Avoid
import logo from "@/assets/logo.png"
```

## Development Best Practices

1. **Component Organization**: Place components in the appropriate subdirectory based on their scope and reusability
2. **Data Management**: Keep static data in `lib/data/` files and import as needed
3. **Image Optimization**: Use Next.js `Image` component for better performance
4. **TypeScript**: Leverage TypeScript for type safety across the codebase
5. **Styling**: Use TailwindCSS utility classes for consistency and maintainability
6. **Route Groups**: Use route groups in the `app/` directory to organize pages logically

## Removed Files and Directories

The following items were removed during the cleanup process:

- **`.next/`**: Build artifacts (regenerated during build)
- **`node_modules/`**: Dependencies (regenerated via `npm install`)
- **`globals.css.backup`**: Backup file (not needed)
- **`grep.exe.stackdump`**: System file (not needed)
- **`READ.txt`**: Temporary notes (not needed)
- **Root `assets/` folder**: Consolidated into `public/images/`

## Consolidated Assets

All images from the root `assets/` folder and `public/assets/` folder have been consolidated into `public/images/` with the following structure:

- Product images → `public/images/products/`
- Brand-related images → `public/images/for-brands/`
- Logos → `public/images/logos/`
- Icons and SVGs → `public/images/icons/`
- UI elements → `public/images/elements/`

All import statements have been updated to reflect the new paths.

## Deployment

To deploy this project:

1. Build the production version:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Deploy to your hosting platform (Vercel, AWS, etc.)

## Contributing

When contributing to this project:

1. Follow the folder structure conventions
2. Place new components in the appropriate subdirectory
3. Update image paths to use the `public/images/` convention
4. Ensure TypeScript types are properly defined
5. Test changes locally before committing

## Troubleshooting

### Images not loading
- Ensure image paths start with `/images/` (not `@/assets/`)
- Verify the image file exists in the `public/images/` directory
- Check browser console for 404 errors

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear the `.next/` directory and rebuild: `rm -rf .next && npm run build`
- Check for TypeScript errors: `npm run lint`

### Development server not starting
- Ensure Node.js version is 18.0 or higher
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is already in use

## Support

For issues or questions about the project structure, please refer to this README or contact the development team.

## License

[Add your license information here]
