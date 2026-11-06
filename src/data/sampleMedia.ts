/**
 * Sample MediaStore items for Personal Media Hub Simulator
 */

export interface MediaAudio {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number; // in milliseconds
  size: number; // bytes
  mimeType: string;
  sampleUrl: string;
}

export interface MediaImage {
  id: number;
  displayName: string;
  resolution: string;
  size: number;
  dateAdded: string;
  mimeType: string;
  url: string;
}

export interface MediaVideo {
  id: number;
  displayName: string;
  duration: number; // in milliseconds
  resolution: string;
  size: number;
  mimeType: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export const INITIAL_AUDIOS: MediaAudio[] = [
  {
    id: 101,
    title: "Synthwave Sunset Horizons",
    artist: "Aero & The Soundwaves",
    album: "Neon Echoes",
    duration: 194000,
    size: 6240000,
    mimeType: "audio/mpeg",
    sampleUrl: "https://actions.google.com/sounds/v1/weather/light_rain.ogg"
  },
  {
    id: 102,
    title: "Midnight Lo-Fi Chill Hop",
    artist: "Urban Solitude",
    album: "Study Session Vol. 4",
    duration: 142000,
    size: 4560000,
    mimeType: "audio/mpeg",
    sampleUrl: "https://actions.google.com/sounds/v1/water/rain_heavy.ogg"
  },
  {
    id: 103,
    title: "Acoustic Forest Sunrise",
    artist: "Elena Vance",
    album: "Acoustic Wanderlust",
    duration: 218000,
    size: 7890000,
    mimeType: "audio/mpeg",
    sampleUrl: "https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg"
  },
  {
    id: 104,
    title: "Cyberpunk Alley Bassline",
    artist: "Zero Day Protocol",
    album: "Underground Network",
    duration: 168000,
    size: 5410000,
    mimeType: "audio/mpeg",
    sampleUrl: "https://actions.google.com/sounds/v1/transportation/car_passing_by.ogg"
  }
];

export const INITIAL_IMAGES: MediaImage[] = [
  {
    id: 201,
    displayName: "IMG_20261102_Sunset_Pier.jpg",
    resolution: "3840 x 2160",
    size: 3840000,
    dateAdded: "Nov 2, 2026",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 202,
    displayName: "IMG_20261103_Alps_Summit.jpg",
    resolution: "4032 x 3024",
    size: 4920000,
    dateAdded: "Nov 3, 2026",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 203,
    displayName: "IMG_20261104_Tokyo_Neon_Night.jpg",
    resolution: "3000 x 2000",
    size: 3120000,
    dateAdded: "Nov 4, 2026",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 204,
    displayName: "IMG_20261105_Espresso_Craft.jpg",
    resolution: "3840 x 2560",
    size: 2780000,
    dateAdded: "Nov 5, 2026",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 205,
    displayName: "IMG_20261105_Retro_Keyboard_Desk.jpg",
    resolution: "4000 x 2667",
    size: 3450000,
    dateAdded: "Nov 5, 2026",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 206,
    displayName: "IMG_20261105_Forest_Mist_Canopy.jpg",
    resolution: "3900 x 2600",
    size: 4100000,
    dateAdded: "Nov 5, 2026",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
  }
];

export const INITIAL_VIDEOS: MediaVideo[] = [
  {
    id: 301,
    displayName: "VID_20261101_Ocean_Waves_4K.mp4",
    duration: 18000,
    resolution: "1920 x 1080",
    size: 28400000,
    mimeType: "video/mp4",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 302,
    displayName: "VID_20261103_Mountain_Drone_Flyover.mp4",
    duration: 15000,
    resolution: "1920 x 1080",
    size: 24100000,
    mimeType: "video/mp4",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 303,
    displayName: "VID_20261104_City_Traffic_Timelapse.mp4",
    duration: 12000,
    resolution: "1920 x 1080",
    size: 19800000,
    mimeType: "video/mp4",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80"
  }
];

export function formatDurationMs(ms: number): string {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
