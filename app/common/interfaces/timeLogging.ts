export interface TimeLogEntry {
  id: string;
  activity: string;
  hours: number;
  minutes: number;
  category: "productive" | "neutral" | "wasteful";
  timestamp: string;
  synced?: boolean;
  isPomodoro?: boolean;
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

export interface ProductivityScore {
  score: number;
  totalDays: number;
}
// Add default targets
export const DEFAULT_TARGETS: DailyTargets = {
  productiveHours: 4,
  wastefulMaxHours: 1,
  neutralMaxHours: 2,
  timestamp: new Date().toISOString()
};
