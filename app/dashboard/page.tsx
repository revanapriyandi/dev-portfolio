'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AnalyticsData {
    date: string;
    activeUsers: number;
    sessions: number;
    bounceRate: number;
}

export default function Dashboard() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('/api/analytics');
                const result = await response.json();
                console.log('Analytics data:', result);
                if (result.data) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const formattedData = result.data.rows.map((row: any) => ({
                        date: row.dimensionValues[0]?.value || '',
                        activeUsers: parseInt(row.metricValues[0]?.value || '0'),
                        sessions: parseInt(row.metricValues[1]?.value || '0'),
                        bounceRate: parseFloat(row.metricValues[2]?.value || '0'),
                    }));
                    setAnalyticsData(formattedData);
                }
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const series = [
        {
            name: 'Active Users',
            data: analyticsData.map((data) => data.activeUsers),
        },
        {
            name: 'Sessions',
            data: analyticsData.map((data) => data.sessions),
        },
    ];

    const options: ApexOptions = {
        chart: {
            type: 'line',
            toolbar: { show: false },
        },
        xaxis: {
            categories: analyticsData.map((data) => data.date),
        },
        yaxis: {
            labels: {
                formatter: (val) => `${val.toFixed(0)}`,
            },
        },
        tooltip: {
            y: {
                formatter: (val) => `${val}`,
            },
        },
        stroke: {
            curve: 'smooth',
        },
    };

    const widgetData = {
        activeUsers: analyticsData.reduce((sum, data) => sum + data.activeUsers, 0),
        sessions: analyticsData.reduce((sum, data) => sum + data.sessions, 0),
        bounceRate: (
            analyticsData.reduce((sum, data) => sum + data.bounceRate, 0) /
            (analyticsData.length || 1)
        ).toFixed(2),
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-2xl font-bold">Google Analytics Dashboard</h1>
            {loading ? (
                <p>Loading analytics data...</p>
            ) : (
                <>
                    {/* Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white dark:bg-neutral-900 rounded shadow">
                            <h2 className="text-lg font-semibold">Active Users</h2>
                            <p className="text-2xl font-bold">{widgetData.activeUsers}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-neutral-900 rounded shadow">
                            <h2 className="text-lg font-semibold">Sessions</h2>
                            <p className="text-2xl font-bold">{widgetData.sessions}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-neutral-900 rounded shadow">
                            <h2 className="text-lg font-semibold">Average Bounce Rate</h2>
                            <p className="text-2xl font-bold">{widgetData.bounceRate}%</p>
                        </div>
                    </div>

                    {/* Line Chart */}
                    <div className="p-4 bg-white dark:bg-neutral-900 rounded shadow">
                        <h2 className="text-lg font-semibold">Traffic Overview</h2>
                        <Chart options={options} series={series} type="line" height={350} />
                    </div>
                </>
            )}
        </div>
    );
}
