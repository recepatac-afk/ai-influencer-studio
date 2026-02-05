
export enum AppStep {
  IDENTITY,
  COMPANION,
  LOCATION,
  OUTFIT,
  BRAND,
  POSE_LOCK,
  SCENARIO,
  VIDEO_SIZE,
  VIDEO_PREVIEW,
  VIDEO_MOTION,
  VIDEO_MUSIC,
  GENERATION
}

export interface InfluencerData {
  images: string[];
  companionImage: string | null;
  productImage: string | null;
  poseImage: string | null;
  location: string;
  outfit: string;
  timeAndSeason: { 
    timeOfDay: string; 
    season: string; 
    weather: string 
  };
  scenario: { 
    pose: string; 
    emotion: string; 
    action: string; 
    angle: string; 
    mood: string; 
    role: string 
  };
  videoAspectRatio: "9:16" | "16:9";
  videoMotionPrompt: string;
  videoMusic: string;
}

export interface InfluencerAsset {
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
}

// Add missing enums and interfaces for Influencer personas used in secondary app flows
export enum NicheType {
  FASHION = 'Fashion',
  TECH = 'Tech',
  LIFESTYLE = 'Lifestyle',
  GAMING = 'Gaming',
  FITNESS = 'Fitness'
}

export enum PersonalityType {
  FRIENDLY = 'Friendly',
  PROFESSIONAL = 'Professional',
  EDGY = 'Edgy',
  HUMOROUS = 'Humorous',
  MINIMALIST = 'Minimalist'
}

export interface InfluencerPersona {
  name: string;
  niche: NicheType;
  personality: PersonalityType;
  bio: string;
  catchphrase: string;
  backstory: string;
}

export interface InfluencerProfile extends InfluencerPersona {
  id: string;
  profileImage: string | null;
  assets: InfluencerAsset[];
}
