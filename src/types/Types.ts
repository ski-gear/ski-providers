export interface BasicKeyValueObject {
  [key: string]: string;
}

export interface BasicWebRequest {
  url: string;
  requestType: string;
}

export interface RawRequestBody {
  error?: string;
  formData?: { [key: string]: any };
  raw: any[];
}

export interface GetRequest extends BasicWebRequest {
  requestType: "GET";
  requestParams: BasicKeyValueObject | {};
}

export interface PostRequest extends BasicWebRequest {
  requestType: "POST";
  requestBody: RawRequestBody;
}

export type RawWebRequestData = GetRequest | PostRequest;

export interface FormattedWebRequestData {
  meta: {
    title: string;
  };
  data: FormattedDataItem[];
}

export type Formatting = "string" | "json";

export interface FormattedDataItem {
  label: string;
  value: string;
  formatting: Formatting;
  category?: string | null;
}

export type FormattedDataGroup = FormattedDataItem[];

export interface Provider {
  canonicalName: ProviderCanonicalName;
  displayName: string;
  logo: string;
  pattern: RegExp;
  transformer: (rwrd: RawWebRequestData) => FormattedWebRequestData[];
}

export type ProviderCanonicalName =
  | "Snowplow"
  | "AdobeAnalyticsAppMeasurement"
  | "Nielsen"
  | "Mixpanel"
  | "Krux"
  | "Rubicon"
  | "GoogleAnalytics"
  | "Facebook"
  | "Braze"
  | "TealiumIQ";

export type Version = string;

export type LabelDictionary = BasicKeyValueObject;
