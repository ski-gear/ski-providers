import {
  contains,
  find,
  isNil,
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

const EVENT_PAYLOAD = "Event Payload";
const EVENT = "Event";

const transformer = (rwrd: RawWebRequestData): FormattedWebRequestData[] => {
  return map((fdg: FormattedDataGroup) => {
    const sorted: FormattedDataGroup = sortBy(
      prop("label"),
      map(transform, fdg),
    );
    return setTitle(getEventName(sorted), sorted);
  }, parse(rwrd));
};

export const Snowplow: Provider = {
  canonicalName: "Snowplow",
  displayName: "Snowplow",
  logo: "snowplow.png",
  pattern: /(\/i\?.*tv=js-\d)|(\/com.snowplowanalytics.snowplow\/tp2$)/,
  transformer,
};

const getEventName = (params: FormattedDataItem[]): string => {
  const unknownEvent = "Unknown Event";

  const row = getEventRow(params);
  if (isNil(row)) {
    return unknownEvent;
  }

  const eventType = prop("value", row);

  return when(eventType)
    .is("pv", "Page View")
    .is("ue", getTitleFromUePx(params))
    .is("pp", "Page Ping")
    .is("tr", "Ecommerce transaction")
    .is("ti", "Ecommerce transaction")
    .is("se", "Custom Structured Event")
    .else(unknownEvent);
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
          d => createFormattedDataFromObject(d as BasicKeyValueObject),
          pathOr({}, ["data"], json),
        );
      } catch (error) {
        console.log(`Encountered an error while parsing JSON: ${raw}`);
        return [];
      }
    default:
      return [];
  }
};

const getEventRow = (
  params: FormattedDataItem[],
): FormattedDataItem | undefined => {
  return find(e => propEq("label", EVENT, e), params);
};

const getTitleFromUePx = (params: FormattedDataItem[]): string => {
  try {
    const UE_PX_ROW = find(e => propEq("label", EVENT_PAYLOAD, e), params);
    const json = JSON.parse(propOr({}, "value", UE_PX_ROW));
    return pathOr("Unknown Event", ["data", "data", "event_name"], json);
  } catch (e) {
    return "Unparseable Event";
  }
};

const transform = (datum: FormattedDataItem): FormattedDataItem => {
  const category = categorize(datum.label);
  const label = labelReplacer(datum.label);

  if (contains(datum.label, ["cx", "ue_px"])) {
    const json = formattedJSON(datum.value);
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

const DATA_LABEL = "Data";

const categorize = (label: string): string | null => {
  if (contains(label, ["cx", "ue_px"])) {
    return DATA_LABEL;
  } else {
    return null;
  }
};

const labelReplacer = (label: string): string => {
  return labelReplacerFromDictionary(label, LabelDictionary);
};

const LabelDictionary: LabelDictionary = {
  ue_px: EVENT_PAYLOAD,
  cx: "Context Payload",
  e: EVENT,
};
