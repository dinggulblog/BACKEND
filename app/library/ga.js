import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFileSync } from 'fs';

const credentials = readFileSync('config/secret/credentials-dinggul.json', 'utf8');

const analyticsDataClient = new BetaAnalyticsDataClient(credentials);

const propertyId = process.env.GA_PROPERTY_ID;

export const runReport = async () => {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: '2023-03-01',
        endDate: 'today',
      },
    ],
    dimensions: [
      {
        name: 'pagePath'
      }
    ],
    metrics: [
      {
        name: 'screenPageViews'
      }
    ],
  });

  console.log('Report result:');
  response.rows.forEach(row => {
    console.log(row);
  });
};
