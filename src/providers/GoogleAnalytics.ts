import { defaultTo, find, isNil, map, prop, propOr, sortBy } from "ramda";
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

const EVENT_ACTION = "Event Action";
const HIT_TYPE = "Hit Type";
const PAGEVIEW = "pageview";

const transformer = (rwrd: RawWebRequestData): FormattedWebRequestData[] => {
  return map((fdg: FormattedDataGroup) => {
    const sorted: FormattedDataGroup = sortBy(
      prop("label"),
      map(transform, fdg),
    );
    return setTitle(getEventName(sorted), sorted);
  }, parse(rwrd));
};

const GoogleAnalytics: Provider = {
  canonicalName: "GoogleAnalytics",
  displayName: "Google Analytics",
  logo: "google-analytics.png",
  pattern: /google\-analytics.com(.+)collect\?/,
  transformer,
};

const getEventName = (params: FormattedDataItem[]): string | null => {
  const hitTypeRow = defaultTo(
    {},
    find(e => e.label === HIT_TYPE, params),
  );
  const hitType: string = propOr(null, "value", hitTypeRow);

  const eventRow = defaultTo(
    {},
    find(e => e.label === EVENT_ACTION, params),
  );
  const eventName: string = propOr(null, "value", eventRow);

  if (hitType === PAGEVIEW) {
    return "Page Load";
  } else if (!isNil(eventName)) {
    return eventName;
  } else {
    return "Unknown Event";
  }
};

const parse = (rwrd: RawWebRequestData): FormattedDataGroup[] => {
  switch (rwrd.requestType) {
    case "GET":
      return [createFormattedDataFromObject(rwrd.requestParams)];
    case "POST":
    // return map(createWebRequestParam, toPairs(rwrd.requestBody));
    default:
      return [];
  }
};

const transform = (datum: FormattedDataItem): FormattedDataItem => {
  const category = "Data";
  const label: string = labelReplacer(datum.label);
  return { label, value: datum.value, formatting: "string", category };
};

const labelReplacer = (label: string): string => {
  return labelReplacerFromDictionary(label, LabelDictionary);
};

const LabelDictionary: LabelDictionary = {
  v: "Protocol Version",
  tid: "Tracking ID",
  aip: "Anonymize IP",
  qt: "Queue Time",
  z: "Cache Buster",
  cid: "Client ID",
  sc: "Session Control",
  dr: "Document Referrer",
  cn: "Campaign Name",
  cs: "Campaign Source",
  cm: "Campaign Medium",
  ck: "Campaign Keyword",
  cc: "Campaign Content",
  ci: "Campaign ID",
  gclid: "Google AdWords ID",
  dclid: "Google Display Ads ID",
  sr: "Screen Resolution",
  vp: "Viewport Size",
  de: "Document Encoding",
  sd: "Screen Colors",
  ul: "User Language",
  je: "Java Enabled",
  fl: "Flash Version",
  t: HIT_TYPE,
  ni: "Non-Interaction Hit",
  dl: "Document location URL",
  dh: "Document Host Name",
  dp: "Document Path",
  dt: "Document Title",
  cd: "Content Description",
  an: "Application Name",
  av: "Application Version",
  ec: "Event Category",
  ea: EVENT_ACTION,
  el: "Event Label",
  ev: "Event Value",
  ti: "Transaction ID",
  ta: "Transaction Affiliation",
  tr: "Transaction Revenue",
  ts: "Transaction Shipping",
  tt: "Transaction Tax",
  in: "Item Name",
  ip: "Item Price",
  iq: "Item Quantity",
  ic: "Item Code",
  iv: "Item Category",
  cu: "Currency Code",
  sn: "Social Network",
  sa: "Social Action",
  st: "Social Action Target",
  utl: "User timing label",
  plt: "Page load time",
  dns: "DNS time",
  pdt: "Page download time",
  rrt: "Redirect response time",
  tcp: "TCP connect time",
  srt: "Server response time",
  exd: "Exception description",
  exf: "Is exception fatal?",
};

export { GoogleAnalytics };
