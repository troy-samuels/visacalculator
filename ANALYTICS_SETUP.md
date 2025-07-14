# Privacy-Compliant Analytics Setup Guide

## Overview

This analytics system provides comprehensive insights into user behavior while maintaining full GDPR/CCPA compliance. It tracks anonymized data to help you understand user patterns, popular destinations, and usage trends.

## Features

### ✅ **What We Track (Privacy-Safe)**
- **Popular Destinations**: Which Schengen countries are most selected
- **Travel Patterns**: Average trip durations, seasonal trends
- **User Origins**: Home countries of users (anonymized)
- **Usage Metrics**: Total calculations, signups, unique sessions
- **Time Series Data**: Daily/weekly/monthly activity trends

### 🔒 **Privacy Compliance**
- **No Personal Identification**: Analytics are completely anonymized
- **Session-Based Tracking**: Uses temporary session IDs, not user IDs
- **Data Minimization**: Only collects essential metrics
- **Automatic Purging**: Data deleted after 12 months
- **User Consent**: Clear privacy notices and opt-out options
- **GDPR/CCPA Compliant**: Full compliance with data protection laws

## Setup Instructions

### 1. Database Setup

First, run the updated database schema to add analytics tables:

```bash
# Deploy the new database schema
psql -h your-db-host -U your-username -d your-database -f scripts/setup-database.sql
```

### 2. Set Admin Access

Update the admin script with your email and run it:

```sql
-- In scripts/set-admin.sql, replace with your email
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-actual-email@example.com';
```

Run in Supabase SQL Editor:
```bash
# Copy the content of scripts/set-admin.sql and run it in Supabase dashboard
```

### 3. Environment Variables

Ensure you have the required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy Application

Deploy your updated application:

```bash
# Build and deploy
npm run build
# Deploy to Vercel, Netlify, or your hosting platform
```

## Accessing Analytics

### Admin Dashboard
- **URL**: `/admin/analytics`
- **Access**: Only available to users with `is_admin = true`
- **Features**: 
  - Real-time metrics dashboard
  - Time period filtering (week, month, quarter, year)
  - Popular destinations and user origins
  - Activity trends over time

### Key Metrics Available

1. **User Metrics**
   - Total new users in period
   - Unique sessions
   - User home countries (anonymized)

2. **Usage Metrics**
   - Total visa calculations performed
   - Most popular destinations
   - Average trip duration
   - Peak usage times

3. **Trend Analysis**
   - Daily activity patterns
   - Seasonal travel preferences
   - Growth metrics over time

## Data Structure

### Analytics Events Table
```sql
analytics_events (
  id: UUID (primary key)
  event_type: VARCHAR(50) -- 'calculation', 'signup', 'destination_selected', etc.
  country_code: VARCHAR(2) -- Destination country
  home_country: VARCHAR(2) -- User's home country (anonymized)
  trip_duration_days: INTEGER -- Length of planned trip
  days_remaining: INTEGER -- Calculated visa days remaining
  session_id: VARCHAR(100) -- Anonymous session identifier
  created_at: TIMESTAMP
)
```

### Daily Summary Table
```sql
analytics_daily_summary (
  id: UUID (primary key)
  date: DATE
  total_calculations: INTEGER
  total_signups: INTEGER
  unique_sessions: INTEGER
  popular_destinations: JSONB -- {'ES': 45, 'FR': 32, 'IT': 28}
  home_country_breakdown: JSONB -- {'US': 123, 'CA': 45, 'AU': 23}
  avg_trip_duration: DECIMAL(5,2)
  created_at: TIMESTAMP
)
```

## Privacy Features

### User Control
- **Privacy Notice**: Automatic popup explaining data collection
- **Opt-Out Option**: Users can disable analytics in profile settings
- **Data Transparency**: Clear explanation of what's tracked
- **Right to Deletion**: Data automatically purged after 12 months

### Technical Safeguards
- **Session-Based IDs**: No personal identifiers stored
- **Anonymized Data**: Country-level only, no precise locations
- **Secure Access**: Admin-only access with authentication
- **Row-Level Security**: Database-level access controls

## Legal Compliance

### GDPR Compliance
- ✅ **Lawful Basis**: Legitimate interest for service improvement
- ✅ **Data Minimization**: Only essential metrics collected
- ✅ **Transparency**: Clear privacy notices
- ✅ **User Rights**: Access, portability, deletion
- ✅ **Retention Limits**: 12-month automatic deletion
- ✅ **Security**: Encrypted storage and transmission

### CCPA Compliance
- ✅ **Notice at Collection**: Privacy notice on first use
- ✅ **Right to Know**: Clear data usage explanations
- ✅ **Right to Delete**: Data purging capabilities
- ✅ **Opt-Out Rights**: User control over tracking

## Maintenance

### Daily Aggregation
The system includes a function to aggregate daily analytics. You can set up a cron job or use Supabase's pg_cron extension:

```sql
-- Run daily at midnight UTC
SELECT cron.schedule('aggregate-daily-analytics', '0 0 * * *', 'SELECT aggregate_daily_analytics();');
```

### Data Retention
Implement automated data purging:

```sql
-- Delete analytics events older than 12 months
DELETE FROM analytics_events 
WHERE created_at < NOW() - INTERVAL '12 months';

-- Delete daily summaries older than 24 months
DELETE FROM analytics_daily_summary 
WHERE created_at < NOW() - INTERVAL '24 months';
```

## Monitoring

### Key Metrics to Watch
1. **User Growth**: New signups over time
2. **Engagement**: Calculations per user
3. **Popular Destinations**: Trending countries
4. **Seasonal Patterns**: Peak travel planning periods
5. **User Origins**: Geographic distribution

### Performance Considerations
- Analytics events are inserted asynchronously
- Failed analytics tracking doesn't affect user experience
- Database indexes optimize query performance
- Pre-aggregated daily summaries improve dashboard speed

## Troubleshooting

### Common Issues

**Analytics not showing data:**
- Verify database schema is up to date
- Check admin user is properly set (`is_admin = true`)
- Ensure analytics events are being inserted

**Performance issues:**
- Check database indexes are created
- Consider increasing aggregation frequency
- Monitor query performance in dashboard

**Privacy concerns:**
- Review data collection practices
- Ensure all PII is anonymized
- Verify opt-out mechanisms work correctly

### Support

For issues with the analytics system:
1. Check database logs for errors
2. Verify RLS policies are working correctly
3. Test admin authentication flow
4. Review analytics event insertion logs

## Best Practices

### Data Collection
- Only track what's necessary for business insights
- Regularly review and minimize data collection
- Implement strong security measures
- Provide clear user notifications

### Legal Compliance
- Regular privacy policy updates
- User consent management
- Data retention policy enforcement
- Regular compliance audits

### Performance Optimization
- Use pre-aggregated summaries for dashboards
- Implement efficient database queries
- Monitor and optimize slow queries
- Regular database maintenance

This analytics system provides powerful insights while respecting user privacy and maintaining full legal compliance. 