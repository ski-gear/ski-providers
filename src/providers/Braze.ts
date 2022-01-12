import {
  contains,
  find,
  map,
  pathOr,
  prop,
  propEq,
  propOr,
  sortBy,
} from "ramda";
import when from "when-switch";
import {
  createFormattedDataFromObject,
  formattedJSON,
  labelReplacerFromDictionary,
  parseRawString,
  setTitle,
  stringFromBytesBuffer,
} from "../PrivateHelpers";
import {
  BasicKeyValueObject,
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
    return setTitle(getBrazeEventName(sorted), sorted);
  }, parse(rwrd));
};

export const Braze: Provider = {
  canonicalName: "Braze",
  displayName: "Braze",
  logo: "braze.png",
  pattern: /.*braze\.com\/api\/v3\/data/,
  transformer,
};

const transform = (datum: FormattedDataItem): FormattedDataItem => {
  const category = categorize(datum.label);
  const label: string = labelReplacer(datum.label);

  if (contains(datum.label, ["data"])) {
    const json = JSON.stringify(datum.value, null, 4);
    return {
      label,
      value: json,
      formatting: "json",
      category: "Request Payload",
    };
  } else {
    return {
      label,
      value: datum.value,
      formatting: "string",
      category,
    };
  }
};

const parse = (rwrd: RawWebRequestData): FormattedDataGroup[] => {
  switch (rwrd.requestType) {
    case "GET":
      return [createFormattedDataFromObject(rwrd.requestParams)];
    case "POST":
      const raw = stringFromBytesBuffer(rwrd.requestBody.raw[0].bytes);
      try {
        const json = JSON.parse(raw);
        return map(
          (d) => createFormattedDataFromObject(d as BasicKeyValueObject),
          pathOr({}, ["events"], json),
        );
      } catch (error) {
        console.log(`Encountered an error while parsing JSON: ${raw}`);
        return [];
      }
    default:
      return [];
  }
};

const categorize = (label: string): string | null => {
  return when(label)
    .match(/^events$/i, DATA_LABEL)
    .else(null);
};

const getBrazeEventName = (params: FormattedDataItem[]): string => {
  const unknownEvent = "Unknown Event";
  try {
    const dataRow = find((e) => propEq("label", "data", e), params);
    const json = JSON.parse(propOr({}, "value", dataRow));
    return pathOr("Unknown Event", ["n"], json);
  } catch (e) {
    return unknownEvent;
  }
};

const labelReplacer = (label: string): string => {
  return labelReplacerFromDictionary(label, LabelDictionary);
};

const LabelDictionary: LabelDictionary = {
  lg: "Language",
  n: "Custom event name",
  p: "Custom event property",
  api_key: "API Key",
  session_id: "Session ID",
  user_id: "User ID",
  events: "events",
};
