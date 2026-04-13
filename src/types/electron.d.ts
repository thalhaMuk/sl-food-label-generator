export {};

declare global {
  interface Window {
    electronApi: {
      exportPdf: (html: string) => Promise<{ canceled: boolean; filePath?: string }>;
    };
  }
}
