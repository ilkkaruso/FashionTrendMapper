/**
 * Amazon affiliate link generators (SiteStripe approach)
 *
 * Generates affiliate links to Amazon search results pages.
 * No PA-API required - just needs Amazon Associates partner tag.
 *
 * Link format: https://www.amazon.com/s?k={keyword}&i=fashion&tag={partner-tag}
 */

/**
 * Get Amazon partner tag from environment
 * Uses NEXT_PUBLIC_ prefix so it's available client-side
 */
function getPartnerTag(): string {
  return process.env.NEXT_PUBLIC_AMAZON_TAG || '';
}

/**
 * Generate Amazon search affiliate link for a keyword
 *
 * @param keyword - Search term (typically trend title)
 * @returns Amazon search URL with affiliate tag
 */
export function getAmazonSearchLink(keyword: string): string {
  const partnerTag = getPartnerTag();
  const params = new URLSearchParams({
    k: keyword,
    ...(partnerTag && { tag: partnerTag }),
  });

  return `https://www.amazon.com/s?${params.toString()}`;
}

/**
 * Generate Amazon Fashion department search link
 *
 * More targeted than general search - restricts to Fashion category.
 *
 * @param keyword - Search term (typically trend title)
 * @returns Amazon Fashion search URL with affiliate tag
 */
export function getAmazonFashionLink(keyword: string): string {
  const partnerTag = getPartnerTag();
  const params = new URLSearchParams({
    k: keyword,
    i: 'fashion', // Restrict to Fashion department
    ...(partnerTag && { tag: partnerTag }),
  });

  return `https://www.amazon.com/s?${params.toString()}`;
}

/**
 * Check if affiliate links are configured
 *
 * @returns true if partner tag is set
 */
export function isAffiliateConfigured(): boolean {
  return !!getPartnerTag();
}
