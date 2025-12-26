'use client';

import type { Order } from '@/lib/definitions';
import { StatCard } from './stat-card';
import { DollarSign, Package, TrendingUp, CreditCard } from 'lucide-react';
import AiSummary from './ai-summary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Timestamp } from 'firebase/firestore';

type OverviewProps = {
  orders: Order[];
  isLoading: boolean;
};

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function Overview({ orders, isLoading }: OverviewProps) {
  const validOrders = orders.filter(order => order.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, order) => sum + order.orderPrice, 0);
  const totalExpenses = validOrders.reduce((sum, order) => sum + order.orderCost + order.shippingCost + order.additionalFees, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalOrders = validOrders.length;

  const chartData = useMemo(() => {
    const monthlyRevenue: { [key: string]: number } = {};

    validOrders.forEach(order => {
      // Ensure orderDate can be a Timestamp or string
      const date = order.orderDate instanceof Timestamp ? order.orderDate.toDate() : typeof order.orderDate === 'string' ? parseISO(order.orderDate) : null;
      if (date && !isNaN(date.getTime())) {
        try {
          const month = format(date, 'MMM');
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.orderPrice;
        } catch (error) {
          console.warn(`Invalid date format for order ${order.id}:`, order.orderDate);
        }
      }
    });

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return monthOrder.map(month => ({
      month,
      revenue: monthlyRevenue[month] || 0,
    })).filter(d => d.revenue > 0); // Only show months with revenue

  }, [validOrders]);


  const aiSummaryInput = {
    totalOrders,
    profitMargin: parseFloat(profitMargin.toFixed(2)),
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    startDate: 'the beginning of time',
    endDate: 'today',
  };

  const formatCurrency = (value: number) => value.toLocaleString('fr-MA', {
    style: 'currency',
    currency: 'MAD',
  });

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="lg:col-span-4">
        <AiSummary {...aiSummaryInput} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={isLoading ? '...' : formatCurrency(totalRevenue)}
          icon={<DollarSign />}
          description="Total revenue from all sales."
        />
        <StatCard
          title="Total Profit"
          value={isLoading ? '...' : formatCurrency(totalProfit)}
          icon={<CreditCard />}
          description="Total profit after all expenses."
        />
        <StatCard
          title="Profit Margin"
          value={isLoading ? '...' : `${profitMargin.toFixed(1)}%`}
          icon={<TrendingUp />}
          description="Net profit as a percentage of revenue."
        />
        <StatCard
          title="Total Orders"
          value={isLoading ? '...' : `+${totalOrders}`}
          icon={<Package />}
          description="Total number of orders."
        />
      </div>

      <Card className="lg:col-span-4 shadow-md">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>A dynamic look at your revenue over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No revenue data to display. Add some orders to see the chart.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
