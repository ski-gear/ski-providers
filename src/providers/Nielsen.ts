import { map, prop, sortBy } from "ramda";
import { createFormattedDataFromObject, labelReplacerFromDictionary, setTitle } from "../PrivateHelpers";
import { FormattedDataItem, FormattedWebRequestData, LabelDictionary, Provider, RawWebRequestData } from "../types/Types";

const transformer = (rwrd: RawWebRequestData): FormattedWebRequestData => {
  const formatted: FormattedDataItem[] = parse(rwrd);
  const data: FormattedDataItem[] = sortBy(prop("label"), map(transform, formatted));
  return setTitle("Page View", data);
};

export const Nielsen: Provider = {
  canonicalName: "Nielsen",
  displayName: "Nielsen",
  logo: "nielsen.png",
  pattern: /\.imrworldwide.com\/cgi-bin\/m\?/,
  transformer,
};

const transform = (datum: FormattedDataItem): FormattedDataItem => {
  let category = categorize(datum.label);
  let label: string = labelReplacer(datum.label);
  return { label: label, value: datum.value, formatting: "string", category };
};

const parse = (rwrd: RawWebRequestData): FormattedDataItem[] => {
  switch (rwrd.requestType) {
    case "GET":
      return createFormattedDataFromObject(rwrd.requestParams);
    case "POST":
      console.log(`POST support for ${Nielsen.canonicalName} is not implemented.`);
    default:
      return [];
  }
};

const categorize = (_label: string): string | null => {
  return null;
};

const labelReplacer = (label: string): string => {
  return labelReplacerFromDictionary(label, LabelDictionary);
};

const LabelDictionary: LabelDictionary = {
  lg: "Language",
};