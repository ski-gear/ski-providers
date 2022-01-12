import {
  append,
  concat,
  contains,
  defaultTo,
  dissoc,
  find,
  head,
  intersection,
  isNil,
  keys,
  map,
  merge,
  not,
  pluck,
  prop,
  propOr,
  sortBy,
  values,
} from "ramda";
import {
  binarytoAscii,
  createFormattedDataFromObject,
  formattedJSON,
  labelReplacerFromDictionary,
  setTitle,
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

const transformer = (rwrd: RawWebRequestData): FormattedWebRequestData[] => {
  return map((fdg: FormattedDataGroup) => {
    const sorted: FormattedDataGroup = sortBy(
      prop("label"),
      map(transform, fdg),
    );
    return setTitle(getEventName(sorted), sorted);
  }, parse(rwrd));
};

export const Mixpanel: Provider = {
  canonicalName: "Mixpanel",
  displayName: "Mixpanel",
  logo: "mixpanel.png",
  pattern: /api(\-js)?.mixpanel.com\/(track|engage)\//,
  transformer,
};

const getEventName = (data: FormattedDataItem[]): string => {
  const eventRow = defaultTo(
    {},
    find(e => e.label === "Event", data),
  );
  const trackEventName: string = propOr(null, "value", eventRow);
  if (not(isNil(trackEventName))) {
    return trackEventName;
  } else {
    const possibleOperation = head(
      intersection(values(operations), pluck("label", data)),
    );
    if (not(isNil(possibleOperation))) {
      return possibleOperation as string;
    } else {
      return "Unknown Event";
    }
  }
};

const transform = (datum: FormattedDataItem): FormattedDataItem => {
  const category = categorize(datum.label);
  const label: string = labelReplacer(datum.label);
  const jsonLabels = append("properties", keys(operations));

  if (contains(datum.label, jsonLabels)) {
    const json = JSON.stringify(datum.value, null, 4);
    return { label, value: json, formatting: "json", category };
  } else {
    return {
      label,
      value: datum.value,
      formatting: datum.formatting,
      category,
    };
  }
};

const parse = (rwrd: RawWebRequestData): FormattedDataGroup[] => {
  switch (rwrd.requestType) {
    case "GET":
      return [buildNestedFormattedData(rwrd.requestParams)];
    case "POST":
      console.log(
        `POST support for ${Mixpanel.canonicalName} is not implemented.`,
      );
    default:
      return [];
  }
};

const buildNestedFormattedData = (
  raw: BasicKeyValueObject,
): FormattedDataItem[] => {
  const data = createFormattedDataFromObject(
    JSON.parse(binarytoAscii(raw.data)),
  );
  return concat(data, createFormattedDataFromObject(dissoc("data", raw)));
};

const categorize = (label: string): string | null => {
  return null;
};

const labelReplacer = (label: string): string => {
  return labelReplacerFromDictionary(label, LabelDictionary);
};

const operations: BasicKeyValueObject = {
  $set: "Set Operation",
  $add: "Add Operation",
  $append: "Append Operation",
  $union: "Union Operation",
  $remove: "Union Operation",
  $unset: "Union Operation",
  $delete: "Delete Operation",
};

const generalLabels: LabelDictionary = {
  ip: "IP Address",
  redirect: "Redirect URL",
  img: "Serve Image?",
  callback: "Callback function",
  verbose: "Verbose?",
  event: "Event",
  $token: "Token",
  $distinct_id: "Distinct Id",
  $ip: "IP Address",
  $time: "Time",
  $ignore_time: "Ignore Time?",
  $ignore_alias: "Ignore Alias",
  $first_name: "First Name",
  $last_name: "Last Name",
  $created: "Created",
  $email: "Email",
  $phone: "Phone",
};

const LabelDictionary: LabelDictionary = merge(operations, generalLabels);
