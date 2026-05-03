export interface StoredFile {
  url: string;
  relativePath: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export interface StorageDriver {
  save(buffer: Buffer, relativePath: string, mimeType: string): Promise<StoredFile>;
  delete(relativePath: string): Promise<void>;
}

export const STORAGE_DRIVER = Symbol('STORAGE_DRIVER');
