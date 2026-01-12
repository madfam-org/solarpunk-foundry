'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '../lib/utils';

// ============================================
// Types
// ============================================

interface CompetitorPricing {
  name: string;
  basePrice: number;
  perMauPrice: number;
  freeLimit: number;
  enterpriseThreshold?: number;
}

interface EncliiTier {
  name: string;
  price: number;
  maxNodes: number;
  features: string[];
}

interface CalculatorProps {
  /** Monthly Active Users */
  className?: string;
  /** Show detailed breakdown */
  showBreakdown?: boolean;
  /** Custom competitors to compare */
  competitors?: CompetitorPricing[];
  /** Dark mode styling */
  darkMode?: boolean;
  /** Callback when calculation changes */
  onCalculate?: (result: CalculationResult) => void;
}

interface CalculationResult {
  mau: number;
  developers: number;
  competitorCosts: { name: string; monthly: number; annual: number }[];
  encliijanuaCost: { monthly: number; annual: number; tier: string };
  savings: { monthly: number; annual: number; percentage: number };
}

// ============================================
// Default Data
// ============================================

const DEFAULT_COMPETITORS: CompetitorPricing[] = [
  { name: 'Auth0', basePrice: 23, perMauPrice: 0.023, freeLimit: 7500, enterpriseThreshold: 100000 },
  { name: 'Clerk', basePrice: 25, perMauPrice: 0.02, freeLimit: 10000, enterpriseThreshold: 100000 },
  { name: 'Vercel + Auth0', basePrice: 43, perMauPrice: 0.025, freeLimit: 5000 },
];

const ENCLII_TIERS: EncliiTier[] = [
  { name: 'Starter', price: 0, maxNodes: 3, features: ['Community support', 'Self-hosted'] },
  { name: 'Pro', price: 199, maxNodes: 10, features: ['Email support', 'Managed updates'] },
  { name: 'Business', price: 499, maxNodes: 25, features: ['Priority support', 'SLA'] },
  { name: 'Enterprise', price: 1499, maxNodes: Infinity, features: ['Dedicated support', 'Custom SLA'] },
];

// ============================================
// Helper Functions
// ============================================

function calculateCompetitorCost(competitor: CompetitorPricing, mau: number): number {
  if (mau <= competitor.freeLimit) {
    return 0;
  }

  if (competitor.enterpriseThreshold && mau > competitor.enterpriseThreshold) {
    // Estimate enterprise pricing (typically 2-3x per-unit cost)
    return competitor.basePrice + (mau * competitor.perMauPrice * 2);
  }

  const billableMau = mau - competitor.freeLimit;
  return competitor.basePrice + (billableMau * competitor.perMauPrice);
}

function getRecommendedTier(mau: number, developers: number): EncliiTier {
  // Rough estimate: 1 node per 50K MAU or per 3 developers
  const nodesNeeded = Math.max(Math.ceil(mau / 50000), Math.ceil(developers / 3), 1);

  for (const tier of ENCLII_TIERS) {
    if (nodesNeeded <= tier.maxNodes) {
      return tier;
    }
  }

  return ENCLII_TIERS[ENCLII_TIERS.length - 1];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
}

// ============================================
// Component
// ============================================

export function PricingCalculator({
  className = '',
  showBreakdown = true,
  competitors = DEFAULT_COMPETITORS,
  darkMode = false,
  onCalculate,
}: CalculatorProps) {
  const [mau, setMau] = useState(10000);
  const [developers, setDevelopers] = useState(5);

  const calculation = useMemo((): CalculationResult => {
    const competitorCosts = competitors.map((c) => {
      const monthly = calculateCompetitorCost(c, mau);
      return {
        name: c.name,
        monthly,
        annual: monthly * 12,
      };
    });

    const tier = getRecommendedTier(mau, developers);
    const encliijanuaCost = {
      monthly: tier.price,
      annual: tier.price * 12,
      tier: tier.name,
    };

    // Calculate savings vs highest competitor
    const maxCompetitorMonthly = Math.max(...competitorCosts.map((c) => c.monthly));
    const savings = {
      monthly: maxCompetitorMonthly - encliijanuaCost.monthly,
      annual: (maxCompetitorMonthly - encliijanuaCost.monthly) * 12,
      percentage: maxCompetitorMonthly > 0
        ? Math.round(((maxCompetitorMonthly - encliijanuaCost.monthly) / maxCompetitorMonthly) * 100)
        : 0,
    };

    const result = { mau, developers, competitorCosts, encliijanuaCost, savings };

    if (onCalculate) {
      onCalculate(result);
    }

    return result;
  }, [mau, developers, competitors, onCalculate]);

  // Styling classes based on dark mode
  const baseClasses = darkMode
    ? 'bg-gray-800 text-white border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';

  const inputClasses = darkMode
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-gray-50 border-gray-300 text-gray-900';

  const labelClasses = darkMode ? 'text-gray-300' : 'text-gray-600';
  const mutedClasses = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={cn('rounded-2xl border p-6', baseClasses, className)}>
      <h3 className="text-xl font-bold mb-6">Calculate Your Savings</h3>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelClasses}`}>
            Monthly Active Users (MAU)
          </label>
          <input
            type="range"
            min={1000}
            max={1000000}
            step={1000}
            value={mau}
            onChange={(e) => setMau(Number(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-2">
            <span className={`text-sm ${mutedClasses}`}>1K</span>
            <span className="text-lg font-bold text-blue-600">{formatNumber(mau)}</span>
            <span className={`text-sm ${mutedClasses}`}>1M</span>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${labelClasses}`}>
            Team Size (Developers)
          </label>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={developers}
            onChange={(e) => setDevelopers(Number(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-2">
            <span className={`text-sm ${mutedClasses}`}>1</span>
            <span className="text-lg font-bold text-blue-600">{developers}</span>
            <span className={`text-sm ${mutedClasses}`}>50</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Savings Highlight */}
        {calculation.savings.monthly > 0 && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              Save {formatCurrency(calculation.savings.annual)}/year
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              {calculation.savings.percentage}% less than competitors
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {showBreakdown && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="text-left py-3 font-medium">Provider</th>
                  <th className="text-right py-3 font-medium">Monthly</th>
                  <th className="text-right py-3 font-medium">Annual</th>
                </tr>
              </thead>
              <tbody>
                {calculation.competitorCosts.map((c, idx) => (
                  <tr key={idx} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 ${mutedClasses}`}>{c.name}</td>
                    <td className={`text-right py-3 ${mutedClasses}`}>
                      {c.monthly === 0 ? 'Free' : formatCurrency(c.monthly)}
                    </td>
                    <td className={`text-right py-3 ${mutedClasses}`}>
                      {c.annual === 0 ? 'Free' : formatCurrency(c.annual)}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-3">
                    <span className="text-blue-600">Enclii + Janua</span>
                    <span className={`text-xs ml-2 ${mutedClasses}`}>({calculation.encliijanuaCost.tier})</span>
                  </td>
                  <td className="text-right py-3 text-blue-600">
                    {calculation.encliijanuaCost.monthly === 0 ? 'Free' : formatCurrency(calculation.encliijanuaCost.monthly)}
                  </td>
                  <td className="text-right py-3 text-blue-600">
                    {calculation.encliijanuaCost.annual === 0 ? 'Free' : formatCurrency(calculation.encliijanuaCost.annual)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tier Recommendation */}
        <div className={`text-sm ${mutedClasses} mt-4`}>
          <strong>Recommended tier:</strong> {calculation.encliijanuaCost.tier}
          {' '}— Based on {formatNumber(mau)} MAU and {developers} developers
        </div>
      </div>
    </div>
  );
}

export default PricingCalculator;
