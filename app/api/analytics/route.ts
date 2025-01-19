import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@google-cloud/local-auth';
import { credential } from 'firebase-admin';

const analyticsreporting = google.analyticsreporting('v4');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_: NextRequest) {
    // try {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'service-account.json',
        scopes: ['https://www.googleapis.com/auth/analytics'],
    });

    const analyticsreporting = google.analyticsreporting({
        version: 'v4',
        auth
    });

    const response = await analyticsreporting.reports.batchGet({
        requestBody: {
            reportRequests: [{
                viewId: '473446153',
                dateRanges: [{
                    startDate: '7daysAgo',
                    endDate: 'today'
                }],
                metrics: [{
                    expression: 'ga:users'
                }]
            }]
        }
    });

    return NextResponse.json({ data: response.data });
    // } catch (error) {
    //     console.error('Error fetching Google Analytics data:', error);
    //     return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    // }
}
