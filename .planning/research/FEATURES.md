# Features Research

## Table Stakes

Features users expect from a trends visualization site. Missing these = users leave.

| Feature | Complexity | Notes |
|---------|------------|-------|
| Visual trend display | High | The core product — bubbles showing trends |
| Trend names clearly visible | Low | Text on bubbles |
| Popularity indication | Medium | Size = popularity, intuitive |
| Daily updates | Medium | Fresh data, not stale |
| Mobile-responsive | Medium | Many users browse on phones |
| Fast load time | Medium | Visualization must render quickly |
| Click for details | Low | Modal or page with more info |
| Source attribution | Low | Where does the data come from? |

## Differentiators

Features that would make this stand out from competitors.

| Feature | Complexity | Notes |
|---------|------------|-------|
| **Animated physics simulation** | High | Crypto Bubbles style — bubbles float, collide, settle |
| **Multi-source aggregation** | High | Combining Google Trends + Reddit + Pinterest |
| **Affiliate integration** | Medium | Immediate path to purchase |
| **Trend history/archive** | Medium | What was trending last week/month? |
| **Change indicators** | Low | "+15% today" — shows momentum |
| **Category filtering** | Medium | Filter by clothing, styles, brands, colors |
| **Search within trends** | Low | Find specific trend quickly |
| **Trend alerts** | High | Notify when trend hits threshold (v2) |
| **Personalization** | High | Save favorite trends, custom views (v2) |
| **Social sharing** | Low | Share individual trend bubbles |

## Anti-Features

Things to deliberately NOT build and why.

| Anti-Feature | Why NOT |
|--------------|---------|
| User accounts for browsing | Adds friction, no value for casual users |
| Comments/social features | Not a social platform, focus on data |
| User-submitted trends | Quality control nightmare, trust the data |
| Real-time updates | Overkill for fashion (not crypto), adds complexity |
| Price tracking | Different product, scope creep |
| Outfit recommendations | AI complexity, different product |
| Brand partnerships/sponsored content | Compromises trust, adds sales complexity |
| Mobile app | Web works fine, app store approval hassle |

## Feature Dependencies

```
Data Fetching (Google Trends, Reddit)
    ↓
Trend Aggregation & Scoring
    ↓
Database Storage
    ↓
┌─────────────────────────────────────────┐
│                                         │
▼                                         ▼
Bubble Visualization              Past Trends Archive
    │                                     │
    ▼                                     ▼
Trend Modal ◄─────────────────────────────┘
    │
    ▼
Affiliate Links (requires Top 10 logic)
    │
    ▼
Amazon Product Search
```

**Critical path:**
1. Data fetching must work first
2. Then aggregation/scoring
3. Then visualization
4. Affiliate links are additive (don't block core experience)

## Complexity Assessment

| Feature | Effort | Dependencies |
|---------|--------|--------------|
| Bubble visualization with D3 physics | 3-4 days | None |
| Google Trends fetching | 1-2 days | pytrends setup |
| Reddit fetching | 1 day | Reddit API credentials |
| Trend scoring/normalization | 1-2 days | Data fetchers |
| Database schema + storage | 1 day | Supabase setup |
| Daily cron job | 0.5 days | Vercel config |
| Trend modal | 1 day | Visualization |
| Amazon PA-API integration | 2 days | Associates approval |
| Past trends page | 1 day | Database |
| Admin dashboard | 2-3 days | Auth setup |
| Mobile responsiveness | 1 day | Throughout |

**Total estimate: 15-20 days of focused work**
