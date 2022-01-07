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
        console.log(
            `GET support for ${Braze.canonicalName} is not implemented.`,
          );
        // return [createFormattedDataFromObject(rwrd.requestParams)];
    case "POST":
      console.log(
        `POST support for ${Braze.canonicalName} is not implemented.`,
      );
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
