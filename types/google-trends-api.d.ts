/**
 * Type declarations for google-trends-api package
 * The package doesn't provide its own types
 */

declare module 'google-trends-api' {
  export interface DailyTrendsOptions {
    geo?: string;
    trendDate?: Date;
  }

  export interface InterestOverTimeOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
    granularTimeResolution?: boolean;
  }

  export interface RelatedQueriesOptions {
    keyword: string;
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
  }

  const googleTrends: {
    dailyTrends(options?: DailyTrendsOptions): Promise<string>;
    interestOverTime(options: InterestOverTimeOptions): Promise<string>;
    relatedQueries(options: RelatedQueriesOptions): Promise<string>;
  };

  export default googleTrends;
}
