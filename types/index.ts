export interface ThreatInfo {
  id: string;
  type: 'phishing' | 'malware' | 'scam' | 'fraud' | 'casino' | 'impersonation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  url: string;
  domain: string;
  riskScore: number;
  timestamp: Date;
  source: 'sms' | 'clipboard' | 'manual' | 'qr';
  description: string;
  indicators: string[];
  recommendedAction: string;
}

export interface SecurityScore {
  overall: number;
  phishing: number;
  malware: number;
  network: number;
  privacy: number;
  lastScan: Date;
  threatsBlocked: number;
  safeBrowsing: boolean;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  rainChance: number;
  hourlyForecast: HourlyForecast[];
  airQuality: number;
  alerts: WeatherAlert[];
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  rainChance: number;
}

export interface WeatherAlert {
  type: 'heat' | 'rain' | 'uv' | 'air-quality';
  severity: 'warning' | 'alert' | 'info';
  message: string;
  recommendation: string;
}

export interface ScanResult {
  url: string;
  isThreat: boolean;
  riskLevel: 'safe' | 'suspicious' | 'dangerous' | 'critical';
  threatScore: number;
  domainInfo: DomainInfo;
  redirects: string[];
  indicators: ThreatIndicators;
  timestamp: Date;
}

export interface DomainInfo {
  domain: string;
  tld: string;
  registrationDate?: Date;
  registrar?: string;
  country?: string;
  isNew: boolean;
  isSuspicious: boolean;
}

export interface ThreatIndicators {
  hasPhishingKeywords: boolean;
  isShortenedUrl: boolean;
  hasRedirect: boolean;
  isFakeDomain: boolean;
  matchesKnownPattern: boolean;
  hasSuspiciousTLD: boolean;
  isCasinoRelated: boolean;
  isBankingImpersonation: boolean;
}

export interface SecurityTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'analysis' | 'checking' | 'privacy' | 'network';
  isAvailable: boolean;
}
