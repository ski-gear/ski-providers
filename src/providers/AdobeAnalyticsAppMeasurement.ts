import { Provider, WebRequestParam, WebRequestData, LabelDictionary } from "../types/Types";
import { find, map, assoc, prop, propOr, sortBy, contains, pluck, defaultTo, isEmpty } from "ramda";
import { labelReplacerFromDictionary, setTitle } from "../PrivateHelpers";
import when from "when-switch";

const LINK_TYPE = "Link type";
const EVENTS = "Events";

const transformer = (data: WebRequestData): WebRequestData => {
  const params: WebRequestParam[] = sortBy(prop("label"), map(transform, data.params));
  const dataWithTitle = setTitle(getEventName(params), data);
  return assoc("params", params, dataWithTitle);
};

export const AdobeAnalyticsAppMeasurement: Provider = {
  canonicalName: "AdobeAnalyticsAppMeasurement",
  displayName: "Adobe Analytics AppMeasurement",
  logo: "adobe-analytics-app-measurement.png",
  pattern: /\/b\/ss\/|2o7/,
  transformer: transformer,
};

const getEventName = (params: WebRequestParam[]): string | null => {
  const isCustomEvent = contains(LINK_TYPE, map(p => prop("label", p), params));
  const eventRow = defaultTo({}, find(e => e.label == EVENTS, params));

  const eventName: string = propOr("Unknown Event", "value", eventRow);
  if (isCustomEvent) {
    return eventName;
  } else {
    return isEmpty(eventRow) ? "Page Load" : `Page Load (${eventName})`;
  }
};

const transform = (datum: WebRequestParam): WebRequestParam => {
  let category = categorize(datum.label);
  let label: string = labelReplacer(datum.label);
  return { label: label, value: datum.value, valueType: "string", category };
};

const DATA_LABEL = "Evars & Props";

const categorize = (label: string): string | null => {
  return when(label)
    .match(/^(v|evar)(\d+)$/i, DATA_LABEL)
    .match(/^(c|prop)(\d+)$/i, DATA_LABEL)
    .else(null);
};

const labelReplacer = (label: string): string => {
  return when(label)
    .match(/^(v|evar)(\d+)$/i, `eVar${RegExp.$2}`)
    .match(/^(c|prop)(\d+)$/i, `Prop${RegExp.$2}`)
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
};