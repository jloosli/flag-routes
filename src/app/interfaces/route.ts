export interface IRoute {
  $key?: string;
  deliveries?: { [id: string]: boolean };
  houses?: Array<string>;
  lat?: number;
  lng?: number;
  name: string;
}
