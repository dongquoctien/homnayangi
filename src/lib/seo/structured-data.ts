export interface OrganizationSchemaOptions {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

export interface WebSiteSchemaOptions {
  name: string;
  url: string;
  description?: string;
  inLanguage?: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleSchemaOptions {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo?: string;
  };
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface RecipeSchemaOptions {
  name: string;
  description: string;
  image?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  recipeIngredient?: string[];
  recipeInstructions?: Array<{
    text: string;
  }>;
  author?: {
    name: string;
  };
  datePublished?: string;
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
  };
}

/**
 * Generate Organization schema for JSON-LD
 */
export function generateOrganizationSchema(options: OrganizationSchemaOptions): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: options.name,
    url: options.url,
    ...(options.logo && { logo: options.logo }),
    ...(options.description && { description: options.description }),
    ...(options.sameAs && options.sameAs.length > 0 && { sameAs: options.sameAs }),
  };
}

/**
 * Generate WebSite schema for JSON-LD
 */
export function generateWebSiteSchema(options: WebSiteSchemaOptions): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: options.name,
    url: options.url,
    ...(options.description && { description: options.description }),
    ...(options.inLanguage && { inLanguage: options.inLanguage }),
  };

  if (options.potentialAction) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: options.potentialAction.target,
      },
      'query-input': options.potentialAction.queryInput,
    };
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema for JSON-LD
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Article schema for JSON-LD
 */
export function generateArticleSchema(options: ArticleSchemaOptions): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.headline,
    description: options.description,
    ...(options.image && { image: options.image }),
    datePublished: options.datePublished,
    dateModified: options.dateModified || options.datePublished,
    author: {
      '@type': 'Person',
      name: options.author.name,
      ...(options.author.url && { url: options.author.url }),
    },
    publisher: {
      '@type': 'Organization',
      name: options.publisher.name,
      ...(options.publisher.logo && {
        logo: {
          '@type': 'ImageObject',
          url: options.publisher.logo,
        },
      }),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': options.url,
    },
  };
}

/**
 * Generate FAQPage schema for JSON-LD
 */
export function generateFAQSchema(items: FAQItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Generate Recipe schema for JSON-LD
 */
export function generateRecipeSchema(options: RecipeSchemaOptions): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: options.name,
    description: options.description,
  };

  if (options.image) schema.image = options.image;
  if (options.prepTime) schema.prepTime = options.prepTime;
  if (options.cookTime) schema.cookTime = options.cookTime;
  if (options.totalTime) schema.totalTime = options.totalTime;
  if (options.recipeYield) schema.recipeYield = options.recipeYield;
  if (options.recipeCategory) schema.recipeCategory = options.recipeCategory;
  if (options.recipeCuisine) schema.recipeCuisine = options.recipeCuisine;
  if (options.recipeIngredient) schema.recipeIngredient = options.recipeIngredient;
  if (options.datePublished) schema.datePublished = options.datePublished;

  if (options.recipeInstructions) {
    schema.recipeInstructions = options.recipeInstructions.map((instruction, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: instruction.text,
    }));
  }

  if (options.author) {
    schema.author = {
      '@type': 'Person',
      name: options.author.name,
    };
  }

  if (options.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: options.aggregateRating.ratingValue,
      ratingCount: options.aggregateRating.ratingCount,
    };
  }

  return schema;
}

/**
 * Serialize structured data to JSON-LD script tag content
 */
export function serializeStructuredData(data: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(data, null, 0);
}
