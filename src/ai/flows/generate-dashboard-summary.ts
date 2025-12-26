'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a summary of the key metrics on the dashboard.
 *
 * It uses generative AI to provide a quick overview of the Etsy business performance.
 *
 * - generateDashboardSummary - A function that triggers the dashboard summary generation flow.
 * - GenerateDashboardSummaryInput - The input type for the generateDashboardSummary function.
 * - GenerateDashboardSummaryOutput - The return type for the generateDashboardSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDashboardSummaryInputSchema = z.object({
  totalOrders: z.number().describe('The total number of orders.'),
  profitMargin: z.number().describe('The profit margin percentage.'),
  totalRevenue: z.number().describe('The total revenue generated.'),
  totalExpenses: z.number().describe('The total expenses incurred.'),
  startDate: z.string().describe('The start date for the period being summarized.'),
  endDate: z.string().describe('The end date for the period being summarized.'),
});
export type GenerateDashboardSummaryInput = z.infer<typeof GenerateDashboardSummaryInputSchema>;

const GenerateDashboardSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the key metrics on the dashboard.'),
});
export type GenerateDashboardSummaryOutput = z.infer<typeof GenerateDashboardSummaryOutputSchema>;

export async function generateDashboardSummary(input: GenerateDashboardSummaryInput): Promise<GenerateDashboardSummaryOutput> {
  return generateDashboardSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDashboardSummaryPrompt',
  input: {schema: GenerateDashboardSummaryInputSchema},
  output: {schema: GenerateDashboardSummaryOutputSchema},
  prompt: `You are an expert in summarizing business metrics for Etsy store owners.
  Given the following metrics for the period between {{startDate}} and {{endDate}}, generate a concise summary of the Etsy business performance.

  Total Orders: {{totalOrders}}
  Profit Margin: {{profitMargin}}%
  Total Revenue: {{totalRevenue}}
  Total Expenses: {{totalExpenses}}

  Summary:`,
});

const generateDashboardSummaryFlow = ai.defineFlow(
  {
    name: 'generateDashboardSummaryFlow',
    inputSchema: GenerateDashboardSummaryInputSchema,
    outputSchema: GenerateDashboardSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
