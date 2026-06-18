export interface UploadResult {
  key: string;
}

export interface IStorageProvider {
  upload(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<UploadResult>;

  delete(key: string): Promise<void>;
}