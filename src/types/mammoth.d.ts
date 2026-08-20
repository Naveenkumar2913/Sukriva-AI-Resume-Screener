declare module 'mammoth' {
  interface ExtractResult {
    value: string;
    messages: unknown[];
  }
  interface Mammoth {
    extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<ExtractResult>;
  }
  const mammoth: Mammoth;
  export default mammoth;
}
