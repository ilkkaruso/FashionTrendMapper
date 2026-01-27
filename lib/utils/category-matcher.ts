/**
 * Category detection via keyword matching
 *
 * Maps trend titles to categories based on keywords.
 * Used for filtering since database doesn't store categories.
 */

export const CATEGORIES = [
  'all',
  'clothing',
  'styles',
  'brands',
  'colors',
  'accessories',
] as const;

export type Category = typeof CATEGORIES[number];

const CATEGORY_KEYWORDS: Record<Exclude<Category, 'all'>, string[]> = {
  clothing: [
    'jeans', 'dress', 'shirt', 'pants', 'jacket', 'coat', 'sweater',
    'hoodie', 'skirt', 'shorts', 'blazer', 'suit', 'top', 'blouse',
  ],
  styles: [
    'aesthetic', 'style', 'core', 'vibe', 'look', 'outfit', 'fashion',
    'trend', 'vintage', 'retro', 'modern', 'classic', 'casual', 'formal',
  ],
  brands: [
    'nike', 'adidas', 'zara', 'h&m', 'gucci', 'prada', 'chanel', 'dior',
    'balenciaga', 'supreme', 'uniqlo', 'gap', 'levi', 'calvin', 'tommy',
  ],
  colors: [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple',
    'orange', 'brown', 'gray', 'beige', 'navy', 'olive', 'burgundy',
  ],
  accessories: [
    'bag', 'shoe', 'belt', 'hat', 'scarf', 'jewelry', 'watch', 'glasses',
    'sunglasses', 'necklace', 'bracelet', 'earring', 'ring', 'purse',
  ],
};

/**
 * Detect category from trend title via keyword matching
 *
 * @param title - Trend title to categorize
 * @returns First matching category or 'styles' as default
 */
export function detectCategory(title: string): Exclude<Category, 'all'> {
  const lowerTitle = title.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return category as Exclude<Category, 'all'>;
    }
  }

  // Default to 'styles' if no match
  return 'styles';
}
