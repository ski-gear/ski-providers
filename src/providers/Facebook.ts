import { defaultTo, find, map, prop, propOr, sortBy } from "ramda";
import when from "when-switch";
import {
  createFormattedDataFromObject,
  labelReplacerFromDictionary,
  setTitle,
} from "../PrivateHelpers";
import {
  FormattedDataGroup,
  FormattedDataItem,
  FormattedWebRequestData,
  LabelDictionary,
  Provider,
  RawWebRequestData,
} from "../types/Types";

const transformer = (rwrd: RawWebRequestData): FormattedWebRequestData[] => {
  return map((fdg: FormattedDataGroup) => {
    const sorted: FormattedDataGroup = sortBy(
      prop("label"),
      map(transform, fdg),
    );
    return setTitle(getEventName(sorted), sorted);
  }, parse(rwrd));
};

export const Facebook: Provider = {
  canonicalName: "Facebook",
  displayName: "Facebook",
  logo: "facebook.png",
  pattern: /facebook\.com\/tr\/?\?/,
  transformer,
};

const getEventName = (params: FormattedDataItem[]): string | null => {
  const row = find(e => e.label === "fired", params);
  const eventName: string | null = propOr(null, "value", row);
  return defaultTo("Page View", eventName);
};

const parse = (rwrd: RawWebRequestData): FormattedDataGroup[] => {
  switch (rwrd.requestType) {
    case "GET":
      return [createFormattedDataFromObject(rwrd.requestParams)];
    case "POST":
      console.log(
        `POST support for ${Facebook.canonicalName} is not implemented.`,
      );
    default:
      return [];
  }
};

const transform = (datum: FormattedDataItem): FormattedDataItem => {
  const category = categorize(datum.label);
  const label: string = labelReplacer(datum.label);
  return { label, value: datum.value, formatting: "string", category };
};

const DATA_LABEL = "Data Layer";

const categorize = (label: string): string | null => {
  return when(label)
    .match(/^(_k|kpl)(.*)/, DATA_LABEL)
    .else(null);
};

const labelReplacer = (label: string): string => {
  return labelReplacerFromDictionary(label, LabelDictionary);
};

const LabelDictionary: LabelDictionary = {
  "id": "Account",
  "requestType": "Request Type",
  "ev": "Event Type",
  "dl": "Page URL",
  "rl": "Referring URL",
  "ts": "Timestamp",
  "sw": "Screen Width",
  "sh": "Screen Height",
  "v": "Pixel Version",
  "ec": "Event Count",
  "if": "In an iFrame",
  "it": "Initialized Timestamp",
  "r": "Code Branch",
  "cd[content_name]": "Content Name",
  "cd[content_category]": "Content Category",
  "cd[content_ids]": "Product IDs",
  "cd[content_type]": "Content Type",
  "cd[num_items]": "Quantity",
  "cd[search_string]": "Search Keyword",
  "cd[status]": "Registration Status",
  "cd[value]": "Value",
  "cd[currency]": "Currency",
  "ud[uid]": "User ID",
};
