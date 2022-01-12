import { map, prop, sortBy } from "ramda";
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
    return setTitle("Page View", sorted);
  }, parse(rwrd));
};

export const Nielsen: Provider = {
  canonicalName: "Nielsen",
  displayName: "Nielsen",
  logo: "nielsen.png",
  pattern: /\.imrworldwide.com\/cgi-bin\/m\?/,
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
      console.log(
        `POST support for ${Nielsen.canonicalName} is not implemented.`,
      );
    default:
      return [];
  }
};

const categorize = (label: string): string | null => {
  return null;
};

const labelReplacer = (label: string): string => {
  return labelReplacerFromDictionary(label, LabelDictionary);
};

const LabelDictionary: LabelDictionary = {
  lg: "Language",
};
