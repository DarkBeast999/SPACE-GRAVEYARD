export interface Discovery {
  title: string;
  description: string;
  significance: 'critical' | 'major' | 'notable';
  emoji: string;
  sourceAttribution?: string;
}

export interface SourceReference {
  title: string;
  authorOrInstitution?: string;
  year?: number | string;
  publication?: string;
  url?: string;
  doi?: string;
  verificationStatus?: 'verified' | 'curated-record' | 'needs-verification';
}

export interface ArtifactData {
  id: string;
  name: string;
  designation: string;
  type: 'rover' | 'lander' | 'probe' | 'helicopter' | 'reflector' | 'orbiter';
  status: 'active' | 'silent' | 'ghost' | 'destroyed';
  destination: 'moon' | 'mars' | 'deep-space';
  launchDate: string;
  landingOrArrivalDate: string;
  lastContact: string | null;
  plannedDurationDays: number;
  actualDurationDays: number;
  distanceTraveledKm: number;
  massKg: number;
  powerSource: 'solar' | 'rtg' | 'battery';
  location: string;
  coordinates: { lat: number; lon: number } | null;
  funFact: string;
  narrativeIntro: string;
  lastTransmission: string | null;
  discoveries: Discovery[];
  enabledMissions: string[];
  color: string;
  sourceReferences?: (string | SourceReference)[];
  authoritativeUrl?: string;
  instrumentPayload?: string[];
  lastVerifiedDate?: string;
  historicalContextNotes?: string;
}

export interface TimelineEvent {
  id: string;
  year: number;
  month: number;
  title: string;
  description: string;
  artifactId?: string;
  type: 'launch' | 'landing' | 'discovery' | 'milestone' | 'loss';
  destination?: 'moon' | 'mars' | 'deep-space' | 'earth';
  earthEvent: string;
}

export interface UserProgress {
  visitedArtifacts: string[];
  ghostMailsSent: number;
  gameHighScore: number;
  badgesEarned: string[];
}

export interface SignalDelay {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export interface SilenceDuration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
