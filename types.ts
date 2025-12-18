export interface StyleOption {
  id: number;
  prompt: string;
  previewColor: string;
}

export enum AppStatus {
  IDLE = 'idle',
  EDITING = 'editing', // New status for image manipulation
  READY = 'ready',     // Image is cropped and ready for generation
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface StickerGenerationResult {
  imageUrl: string;
  isValid: boolean;
  errors?: string[];
}

export type Language = 'zh-TW' | 'en' | 'ja';
export type ViewMode = 'create' | 'gallery' | 'history';

export interface GalleryItem {
  id: string;
  imageUrl: string;
  styleId: number;
  author: string;
}

export interface StickerRecord {
  id: string;
  imageUrl: string;
  styleId: number;
  timestamp: number;
  sourceImageId?: string; // To link back to a specific source if needed
}
