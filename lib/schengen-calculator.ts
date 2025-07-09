import { differenceInDays, subDays, addDays } from 'date-fns';

export interface TravelRecord {
  id?: string;
  country: string;
  entryDate: Date;
  exitDate: Date;
  notes?: string;
}

export interface SchengenCalculationResult {
  daysUsed: number;
  daysRemaining: number;
  isCompliant: boolean;
  lookbackPeriod: {
    start: Date;
    end: Date;
  };
  relevantStays: RelevantStay[];
}

export interface RelevantStay {
  entryDate: Date;
  exitDate: Date;
  days: number;
  originalEntry: Date;
  originalExit: Date;
  country?: string;
}

export interface NextEntryResult {
  nextPossibleEntry: Date | null;
  daysUntilEntry: number | null;
  daysAvailable: number;
  error?: string;
}

export interface TripValidationResult {
  isValid: boolean;
  tripDuration: number;
  daysAvailableOnEntry: number;
  daysUsedOnExit: number;
  warnings: string[];
  details: {
    entryDate: Date;
    exitDate: Date;
    entryCompliance: SchengenCalculationResult;
    exitCompliance: SchengenCalculationResult;
  };
}

export interface MonthlyBreakdown {
  [monthKey: string]: {
    days: number;
    trips: Array<{
      entryDate: Date;
      exitDate: Date;
      daysInThisMonth: number;
      country?: string;
    }>;
  };
}

export interface AnalyticsData {
  timestamp: string;
  sessionId: string;
  calculation: {
    daysUsed: number;
    daysRemaining: number;
    isCompliant: boolean;
    numberOfTrips: number;
    averageTripLength: number;
  };
  metadata: {
    userAgent: string;
    timezone: string;
    locale: string;
  };
}

export interface AnalyticsSummary {
  totalCalculations: number;
  complianceRate: number;
  averageDaysUsed: number;
  commonPatterns: {
    shortTrips: number;
    mediumTrips: number;
    longTrips: number;
    multipleTrips: number;
  };
  usageByTimezone: Record<string, number>;
  peakUsageTimes: number[];
}

export class SchengenCalculator {
  private schengenCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 
    'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH'
  ];

  /**
   * Calculate the number of days spent in Schengen area in the last 180 days
   */
  calculateDaysInSchengen(travelHistory: TravelRecord[], referenceDate: Date = new Date()): SchengenCalculationResult {
    const lookbackDate = subDays(referenceDate, 179); // 180 days including today

    let daysInSchengen = 0;
    const relevantStays: RelevantStay[] = [];

    // Filter and process travel history
    travelHistory.forEach(trip => {
      const entryDate = new Date(trip.entryDate);
      const exitDate = trip.exitDate ? new Date(trip.exitDate) : referenceDate;

      // Check if this trip is within the 180-day window
      if (exitDate >= lookbackDate && entryDate <= referenceDate) {
        // Calculate the overlap with the 180-day window
        const effectiveEntry = entryDate < lookbackDate ? lookbackDate : entryDate;
        const effectiveExit = exitDate > referenceDate ? referenceDate : exitDate;

        // Calculate days for this trip
        const days = differenceInDays(effectiveExit, effectiveEntry) + 1;
        
        if (days > 0) {
          daysInSchengen += days;
          relevantStays.push({
            entryDate: effectiveEntry,
            exitDate: effectiveExit,
            days: days,
            originalEntry: trip.entryDate,
            originalExit: trip.exitDate,
            country: trip.country
          });
        }
      }
    });

    return {
      daysUsed: daysInSchengen,
      daysRemaining: Math.max(0, 90 - daysInSchengen),
      isCompliant: daysInSchengen <= 90,
      lookbackPeriod: {
        start: lookbackDate,
        end: referenceDate
      },
      relevantStays: relevantStays
    };
  }

  /**
   * Calculate when the user can return to Schengen area
   */
  calculateNextPossibleEntry(travelHistory: TravelRecord[], currentDate: Date = new Date()): NextEntryResult {
    let testDate = addDays(currentDate, 1);

    // Check each future date until we find one where entry is allowed
    for (let i = 0; i < 365; i++) {
      const result = this.calculateDaysInSchengen(travelHistory, testDate);
      
      if (result.daysRemaining > 0) {
        return {
          nextPossibleEntry: testDate,
          daysUntilEntry: i + 1,
          daysAvailable: result.daysRemaining
        };
      }
      
      testDate = addDays(testDate, 1);
    }

    return {
      nextPossibleEntry: null,
      daysUntilEntry: null,
      daysAvailable: 0,
      error: 'Unable to calculate next entry date within 365 days'
    };
  }

  /**
   * Validate a planned trip
   */
  validatePlannedTrip(
    travelHistory: TravelRecord[], 
    plannedEntry: Date, 
    plannedExit: Date,
    country: string = 'DE'
  ): TripValidationResult {
    const entryDate = new Date(plannedEntry);
    const exitDate = new Date(plannedExit);
    const tripDuration = differenceInDays(exitDate, entryDate) + 1;

    // Check compliance on entry date
    const entryCompliance = this.calculateDaysInSchengen(travelHistory, entryDate);
    
    // Add the planned trip to history for exit date calculation
    const futureHistory: TravelRecord[] = [...travelHistory, {
      country: country,
      entryDate: entryDate,
      exitDate: exitDate
    }];
    
    // Check compliance on exit date
    const exitCompliance = this.calculateDaysInSchengen(futureHistory, exitDate);

    return {
      isValid: entryCompliance.daysRemaining >= tripDuration,
      tripDuration: tripDuration,
      daysAvailableOnEntry: entryCompliance.daysRemaining,
      daysUsedOnExit: exitCompliance.daysUsed,
      warnings: this.generateWarnings(entryCompliance, tripDuration),
      details: {
        entryDate: entryDate,
        exitDate: exitDate,
        entryCompliance: entryCompliance,
        exitCompliance: exitCompliance
      }
    };
  }

  /**
   * Generate warnings based on compliance status
   */
  private generateWarnings(compliance: SchengenCalculationResult, plannedDays: number): string[] {
    const warnings: string[] = [];

    if (!compliance.isCompliant) {
      warnings.push('You have already exceeded the 90-day limit in the past 180 days');
    }

    if (compliance.daysRemaining < plannedDays) {
      warnings.push(`You only have ${compliance.daysRemaining} days available, but planning ${plannedDays} days`);
    }

    if (compliance.daysRemaining < 30 && compliance.daysRemaining > 0) {
      warnings.push(`Warning: You only have ${compliance.daysRemaining} days remaining in your 90-day allowance`);
    }

    if (compliance.daysRemaining < 10 && compliance.daysRemaining > 0) {
      warnings.push(`Critical: Only ${compliance.daysRemaining} days left! Plan carefully.`);
    }

    return warnings;
  }

  /**
   * Get a detailed breakdown of days used per month
   */
  getMonthlyBreakdown(travelHistory: TravelRecord[], startDate: Date, endDate: Date): MonthlyBreakdown {
    const breakdown: MonthlyBreakdown = {};
    
    travelHistory.forEach(trip => {
      const entryDate = new Date(trip.entryDate);
      const exitDate = trip.exitDate ? new Date(trip.exitDate) : new Date();

      // Process each month in the range
      let currentDate = new Date(Math.max(entryDate.getTime(), startDate.getTime()));
      while (currentDate <= Math.min(exitDate.getTime(), endDate.getTime())) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!breakdown[monthKey]) {
          breakdown[monthKey] = {
            days: 0,
            trips: []
          };
        }

        // Calculate days in this month
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const effectiveEnd = new Date(Math.min(exitDate.getTime(), monthEnd.getTime(), endDate.getTime()));
        const daysInMonth = differenceInDays(effectiveEnd, currentDate) + 1;

        breakdown[monthKey].days += daysInMonth;
        breakdown[monthKey].trips.push({
          entryDate: trip.entryDate,
          exitDate: trip.exitDate,
          daysInThisMonth: daysInMonth,
          country: trip.country
        });

        // Move to next month
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      }
    });

    return breakdown;
  }
}

export class DataCaptureService {
  private capturedData: AnalyticsData[] = [];

  /**
   * Capture anonymous usage data
   */
  captureAnonymousData(calculationData: SchengenCalculationResult): AnalyticsData {
    const anonymousRecord: AnalyticsData = {
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId(),
      calculation: {
        daysUsed: calculationData.daysUsed,
        daysRemaining: calculationData.daysRemaining,
        isCompliant: calculationData.isCompliant,
        numberOfTrips: calculationData.relevantStays.length,
        averageTripLength: this.calculateAverageTripLength(calculationData.relevantStays)
      },
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US'
      }
    };

    this.capturedData.push(anonymousRecord);
    return anonymousRecord;
  }

  /**
   * Generate anonymous session ID
   */
  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Calculate average trip length
   */
  private calculateAverageTripLength(stays: RelevantStay[]): number {
    if (stays.length === 0) return 0;
    const totalDays = stays.reduce((sum, stay) => sum + stay.days, 0);
    return Math.round(totalDays / stays.length);
  }

  /**
   * Get aggregated analytics
   */
  getAnalytics(): AnalyticsSummary {
    return {
      totalCalculations: this.capturedData.length,
      complianceRate: this.calculateComplianceRate(),
      averageDaysUsed: this.calculateAverageDaysUsed(),
      commonPatterns: this.identifyCommonPatterns(),
      usageByTimezone: this.groupByTimezone(),
      peakUsageTimes: this.identifyPeakUsageTimes()
    };
  }

  /**
   * Calculate compliance rate
   */
  private calculateComplianceRate(): number {
    if (this.capturedData.length === 0) return 0;
    const compliant = this.capturedData.filter(record => record.calculation.isCompliant).length;
    return Math.round((compliant / this.capturedData.length) * 100);
  }

  /**
   * Calculate average days used
   */
  private calculateAverageDaysUsed(): number {
    if (this.capturedData.length === 0) return 0;
    const totalDays = this.capturedData.reduce((sum, record) => sum + record.calculation.daysUsed, 0);
    return Math.round(totalDays / this.capturedData.length);
  }

  /**
   * Identify common usage patterns
   */
  private identifyCommonPatterns() {
    const patterns = {
      shortTrips: 0,  // < 7 days
      mediumTrips: 0, // 7-30 days
      longTrips: 0,   // > 30 days
      multipleTrips: 0 // > 3 trips
    };

    this.capturedData.forEach(record => {
      const avgLength = record.calculation.averageTripLength;
      if (avgLength < 7) patterns.shortTrips++;
      else if (avgLength <= 30) patterns.mediumTrips++;
      else patterns.longTrips++;

      if (record.calculation.numberOfTrips > 3) patterns.multipleTrips++;
    });

    return patterns;
  }

  /**
   * Group usage by timezone
   */
  private groupByTimezone(): Record<string, number> {
    const timezones: Record<string, number> = {};
    this.capturedData.forEach(record => {
      const tz = record.metadata.timezone;
      timezones[tz] = (timezones[tz] || 0) + 1;
    });
    return timezones;
  }

  /**
   * Identify peak usage times
   */
  private identifyPeakUsageTimes(): number[] {
    const hourlyUsage = new Array(24).fill(0);
    this.capturedData.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      hourlyUsage[hour]++;
    });
    return hourlyUsage;
  }

  /**
   * Export analytics data
   */
  exportAnalytics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.getAnalytics(), null, 2);
    } else if (format === 'csv') {
      // Simple CSV export of raw data
      const headers = ['timestamp', 'sessionId', 'daysUsed', 'daysRemaining', 'isCompliant', 'numberOfTrips', 'timezone'];
      const rows = this.capturedData.map(record => [
        record.timestamp,
        record.sessionId,
        record.calculation.daysUsed,
        record.calculation.daysRemaining,
        record.calculation.isCompliant,
        record.calculation.numberOfTrips,
        record.metadata.timezone
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    return '';
  }
}

// Utility function for easy integration
export function processSchengenCalculation(travelDates: TravelRecord[], referenceDate?: Date) {
  const calculator = new SchengenCalculator();
  const dataCapture = new DataCaptureService();

  // Calculate current status
  const currentStatus = calculator.calculateDaysInSchengen(travelDates, referenceDate);
  
  // Capture anonymous data
  dataCapture.captureAnonymousData(currentStatus);

  // Return results
  return {
    status: currentStatus,
    nextEntry: calculator.calculateNextPossibleEntry(travelDates),
    analytics: dataCapture.getAnalytics(),
    calculator,
    dataCapture
  };
} 