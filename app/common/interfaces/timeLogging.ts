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
