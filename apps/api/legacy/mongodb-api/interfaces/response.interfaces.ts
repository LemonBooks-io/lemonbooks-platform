export interface IResponse<T> {
  success: boolean;
  error?: string | null;
  message: string;
  data?: T;
}
