import { map, prop, sortBy } from "ramda";
import when from "when-switch";
import {
  createFormattedDataFromObject,
  labelReplacerFromDictionary,
  parseRawString,
  setTitle,
  stringFromBytesBuffer,
} from "../PrivateHelpers";
import {
  FormattedDataGroup,
  FormattedDataItem,
  FormattedWebRequestData,
  LabelDictionary,
  Provider,
  RawWebRequestData,
} from "../types/Types";

const DATA_LABEL = "events and respond_with";

const transformer = (rwrd: RawWebRequestData): FormattedWebRequestData[] => {
  return map((fdg: FormattedDataGroup) => {
    const sorted: FormattedDataGroup = sortBy(
      prop("label"),
      map(transform, fdg),
    );
    return setTitle("Braze Event", sorted);
  }, parse(rwrd));
};

export const Braze: Provider = {
  canonicalName: "Braze",
  displayName: "Braze",
  logo: "Braze.png",
  pattern: /.*braze\.com\/api\/v3\/data/,
  transformer,
};

const transform = (datum: FormattedDataItem): FormattedDataItem => {
  const category = categorize(datum.label);
  const label: string = labelReplacer(datum.label);
  return { label, value: datum.value, formatting: "string", category };
};

const parse = (rwrd: RawWebRequestData): FormattedDataGroup[] => {
  switch (rwrd.requestType) {
    case "GET":
      return [createFormattedDataFromObject(rwrd.requestParams)];
    case "POST":
      const raw = stringFromBytesBuffer(rwrd.requestBody.raw[0].bytes);
      return [createFormattedDataFromObject(parseRawString(raw))];
    default:
      return [];
  }
};

const categorize = (label: string): string | null => {
  return when(label)
  .match(/^events$/i, DATA_LABEL)
  .else(null);
};

const labelReplacer = (label: string): string => {
  return labelReplacerFromDictionary(label, LabelDictionary);
};

const LabelDictionary: LabelDictionary = {
  lg: "Language",
  n: "Custom event name",
  p: "Custom event property",
  api_key: "API Key",
};
