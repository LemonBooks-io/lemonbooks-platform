/**
 * Utility functions for payment calculations
 */

/**
 * Rounds a monetary value to 4 decimal places to prevent floating-point precision errors
 * @param value - The value to round
 * @returns The rounded value
 */
export function roundMoney(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/**
 * Safely adds monetary values with proper rounding
 * @param values - Array of values to add
 * @returns The sum rounded to 4 decimal places
 */
export function addMoney(...values: number[]): number {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return roundMoney(sum);
}

/**
 * Safely subtracts monetary values with proper rounding
 * @param minuend - The value to subtract from
 * @param subtrahend - The value to subtract
 * @returns The difference rounded to 4 decimal places
 */
export function subtractMoney(minuend: number, subtrahend: number): number {
  return roundMoney(minuend - subtrahend);
}
