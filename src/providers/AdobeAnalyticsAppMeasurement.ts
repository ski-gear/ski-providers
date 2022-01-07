import {
  contains,
  defaultTo,
  find,
  isEmpty,
  map,
  prop,
  propOr,
  sortBy,
} from "ramda";
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

const LINK_TYPE = "Link type";
const LINK_NAME = "Link name";
const EVENTS = "Events";

const transformer = (rwrd: RawWebRequestData): FormattedWebRequestData[] => {
  return map((fdg: FormattedDataGroup) => {
    const sorted: FormattedDataGroup = sortBy(
      prop("label"),
      map(transform, fdg)
    );
    return setTitle(getEventName(sorted), sorted);
  }, parse(rwrd));
};

export const AdobeAnalyticsAppMeasurement: Provider = {
  canonicalName: "AdobeAnalyticsAppMeasurement",
  displayName: "Adobe Analytics AppMeasurement",
  logo: "adobe-analytics-app-measurement.png",
  pattern: /\/b\/ss\/|2o7/,
  transformer,
};

const getEventName = (params: FormattedDataItem[]): string | null => {
  const isCustomEvent = contains(
    LINK_TYPE,
    map((p) => prop("label", p), params)
  );
  const linkRow = defaultTo(
    {},
    find((p) => p.label === LINK_NAME, params)
  );
  const eventRow = defaultTo(
    {},
    find((e) => e.label === EVENTS, params)
  );

  const eventName: string = propOr("Unknown Event", "value", eventRow);
  const linkName: string = propOr("Unknown Link Type", "value", linkRow);

  if (isCustomEvent && isEmpty(eventRow)) {
    return linkName;
  } else if (isCustomEvent && !isEmpty(eventRow)) {
    return eventName;
  } else {
    // Edit this to get rid of events showing in the accordion title
    return isEmpty(eventRow) ? "Page Load" : `Page Load (${eventName})`;
  }
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

const transform = (datum: FormattedDataItem): FormattedDataItem => {
  const category = categorize(datum.label);
  const label: string = labelReplacer(datum.label);
  return { label, value: datum.value, formatting: "string", category };
};

const DATA_LABEL = "Evars, Props, and Lists";

const categorize = (label: string): string | null => {
  return when(label)
    .match(/^(v|evar)(\d+)$/i, DATA_LABEL)
    .match(/^(c|prop)(\d+)$/i, DATA_LABEL)
    .match(/^(l|list)(\d+)$/i, DATA_LABEL)
    .else(null);
};

const labelReplacer = (label: string): string => {
  return when(label)
    .match(/^(v|evar)(\d+)$/i, `eVar${RegExp.$2}`)
    .match(/^(c|prop)(\d+)$/i, `Prop${RegExp.$2}`)
    .match(/^(l|list)(\d+)$/i, `List${RegExp.$2}`)
    .else(labelReplacerFromDictionary(label, LabelDictionary));
};

const LabelDictionary: LabelDictionary = {
  ns: "Visitor namespace",
  ndh: "Image sent from JS?",
  ch: "Channel",
  v0: "Campaign",
  r: "Referrer URL",
  ce: "Character set",
  cl: "Cookie lifetime",
  g: "Current URL",
  j: "JavaScript version",
  bw: "Browser width",
  bh: "Browser height",
  s: "Screen resolution",
  c: "Screen color depth",
  ct: "Connection type",
  p: "Netscape plugins",
  k: "Cookies enabled?",
  hp: "Home page?",
  pid: "Page ID",
  pidt: "Page ID type",
  oid: "Object ID",
  oidt: "Object ID type",
  ot: "Object tag name",
  pe: LINK_TYPE,
  pev1: "Link URL",
  pev2: "Link name",
  pev3: "Video milestone",
  h1: "Hierarchy var1",
  h2: "Hierarchy var2",
  h3: "Hierarchy var3",
  h4: "Hierarchy var4",
  h5: "Hierarchy var5",
  cc: "Currency code",
  t: "Browser time",
  v: "Javascript-enabled browser?",
  pccr: "Prevent infinite redirects",
  vid: "Visitor ID",
  vidn: "New visitor ID",
  fid: "Fallback Visitor ID",
  mid: "Marketing Cloud Visitor ID",
  aid: "Legacy Visitor ID",
  cdp: "Cookie domain periods",
  pageName: "Page name",
  pageType: "Page type",
  server: "Server",
  events: EVENTS,
  products: "Products",
  purchaseID: "Purchase ID",
  state: "Visitor state",
  vmk: "Visitor migration key",
  vvp: "Variable provider",
  xact: "Transaction ID",
  zip: "ZIP/Postal code",
  rsid: "Report Suites",
  pf: "Platform Flag",
  mcorgid: "Marketing Cloud Organization ID",
  sdid: "Supplemental ID",
  AQB: "Image request query string start flag",
  AQE: "Image request query string end flag",
  aamlh: "Audience Manager location hint",
};
