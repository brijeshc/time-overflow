export interface TimeLogEntry {
  id: string;
  activity: string;
  hours: number;
  minutes: number;
  category: "productive" | "neutral" | "wasteful";
  timestamp: string;
  synced?: boolean;
}

export interface TimeLogAnalytics {
  totalProductiveHours: number;
  totalWastefulHours: number;
  totalNeutralHours: number;
  mostFrequentActivity: string;
  averageSessionDuration: number;
}

export interface DailyTargets {
  productiveHours: number;
  wastefulMaxHours: number;
  neutralMaxHours: number;
  timestamp: string;
}

export interface TargetHistory {
  targets: DailyTargets[];
}
// Add default targets
export const DEFAULT_TARGETS: DailyTargets = {
  productiveHours: 6,
  wastefulMaxHours: 2,
  neutralMaxHours: 4,
  timestamp: new Date().toISOString()
};
