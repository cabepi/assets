
export type DepreciationMethod = 'STRAIGHT_LINE' | 'DOUBLE_DECLINING' | 'SUM_OF_DIGITS';

export interface DepreciationContext {
    purchasePrice: number;
    purchaseDate: Date;
    salvageValue: number;
    usefulLifeYears: number;
}

export interface DepreciationResult {
    currentBookValue: number;
    accumulatedDepreciation: number;
    monthlyRate: number; // Approximate current monthly rate
    isFullyDepreciated: boolean;
}

/**
 * Strategy Interface for Depreciation Algorithms
 */
interface DepreciationStrategy {
    calculate(context: DepreciationContext): DepreciationResult;
}

/**
 * 1. Straight Line Method
 * (Cost - Salvage) / Useful Life
 */
class StraightLineStrategy implements DepreciationStrategy {
    calculate(context: DepreciationContext): DepreciationResult {
        const { purchasePrice, purchaseDate, usefulLifeYears, salvageValue } = context;
        const now = new Date();

        // Calculate age in months
        const ageInMilliseconds = now.getTime() - purchaseDate.getTime();
        // 30.44 days per month average
        const ageInMonths = Math.max(0, ageInMilliseconds / (1000 * 60 * 60 * 24 * 30.44));

        const depreciableAmount = Math.max(0, purchasePrice - salvageValue);
        const usefulLifeMonths = usefulLifeYears * 12;

        if (usefulLifeMonths === 0) {
            return {
                currentBookValue: purchasePrice,
                accumulatedDepreciation: 0,
                monthlyRate: 0,
                isFullyDepreciated: false
            };
        }

        const monthlyRate = depreciableAmount / usefulLifeMonths;
        const accumulatedDepreciation = Math.min(depreciableAmount, monthlyRate * ageInMonths);
        const currentBookValue = purchasePrice - accumulatedDepreciation;

        return {
            currentBookValue: Math.max(salvageValue, currentBookValue),
            accumulatedDepreciation,
            monthlyRate: accumulatedDepreciation >= depreciableAmount ? 0 : monthlyRate,
            isFullyDepreciated: accumulatedDepreciation >= depreciableAmount
        };
    }
}

/**
 * 2. Double Declining Balance Method
 * Accelerates depreciation. Formula is complex for partial years, 
 * implementing a simplified monthly iterative approach for accuracy.
 */
class DoubleDecliningBalanceStrategy implements DepreciationStrategy {
    calculate(context: DepreciationContext): DepreciationResult {
        const { purchasePrice, purchaseDate, usefulLifeYears, salvageValue } = context;
        const now = new Date();

        const ageInMilliseconds = now.getTime() - purchaseDate.getTime();
        const ageInMonths = Math.max(0, ageInMilliseconds / (1000 * 60 * 60 * 24 * 30.44));

        // Rate is 2 / Useful Life (in years) per year
        const annualRate = 2 / usefulLifeYears;
        const monthlyRateFactor = annualRate / 12;

        // Simulation for exact current book value (iterative approach is safer for DDB)
        let currentBookValue = purchasePrice;
        let accumulatedDepreciation = 0;
        let currentMonthlyDepreciation = 0;

        // Iterate month by month up to current age
        // Limit iterations to reasonable max (e.g. 100 years) to prevent infinite loops in bad data
        const maxMonths = Math.min(Math.floor(ageInMonths), 1200);

        for (let i = 0; i < maxMonths; i++) {
            if (currentBookValue <= salvageValue) {
                currentMonthlyDepreciation = 0;
                break;
            }

            const depreciation = currentBookValue * monthlyRateFactor;

            // Ensure we don't depreciate below salvage value
            const effectiveDepreciation = Math.min(depreciation, currentBookValue - salvageValue);

            currentBookValue -= effectiveDepreciation;
            accumulatedDepreciation += effectiveDepreciation;
            currentMonthlyDepreciation = effectiveDepreciation;

            if (currentBookValue <= salvageValue) break;
        }

        // Handle fractional month part roughly if needed, or stick to integer months for financial safety.
        // For specific requirement "current status", integer months is standard.

        return {
            currentBookValue: Math.max(salvageValue, currentBookValue),
            accumulatedDepreciation,
            monthlyRate: (currentBookValue <= salvageValue) ? 0 : currentMonthlyDepreciation,
            isFullyDepreciated: currentBookValue <= salvageValue
        };
    }
}

/**
 * Factory and Public API
 */
export class DepreciationCalculator {
    static strategies: Record<DepreciationMethod, DepreciationStrategy> = {
        'STRAIGHT_LINE': new StraightLineStrategy(),
        'DOUBLE_DECLINING': new DoubleDecliningBalanceStrategy(),
        // Fallback to straight line for SYD until implemented if requested, or map it.
        'SUM_OF_DIGITS': new StraightLineStrategy(), // Placeholder for now, typically less used in MVPs
    };

    static calculate(
        method: string,
        context: Omit<DepreciationContext, 'method'>
    ): DepreciationResult {
        // Normalize method string
        let strategyKey: DepreciationMethod = 'STRAIGHT_LINE';

        const normalizedInput = method?.toUpperCase().replace(/\s+/g, '_');
        if (normalizedInput === 'DOUBLE_DECLINING' || normalizedInput === 'DDB') {
            strategyKey = 'DOUBLE_DECLINING';
        } else if (normalizedInput === 'SUM_OF_DIGITS' || normalizedInput === 'SYD') {
            strategyKey = 'SUM_OF_DIGITS';
        }

        const strategy = this.strategies[strategyKey] || this.strategies['STRAIGHT_LINE'];

        return strategy.calculate({
            ...context,
            // Ensure useful life is sane to avoid division by zero
            usefulLifeYears: Math.max(1, context.usefulLifeYears)
        });
    }
}
