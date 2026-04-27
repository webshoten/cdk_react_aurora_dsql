export interface ImageRecord {
  imageId: string;
  imagePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface RegisterImageInput {
  imagePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}
