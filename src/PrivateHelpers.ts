import * as querystring from "querystring";
import { defaultTo, map, propOr, toPairs } from "ramda";
import { URLSearchParams } from "url";
import {
  BasicKeyValueObject,
  FormattedDataItem,
  FormattedWebRequestData,
} from "./types/Types";

export const labelReplacerFromDictionary = (
  label: string,
  dictionary: BasicKeyValueObject,
): string => {
  return propOr(label, label, dictionary);
};

export const setTitle = (
  t: string | null,
  data: FormattedDataItem[],
): FormattedWebRequestData => {
  const title = defaultTo("No Title", t) as string;
  return {
    data,
    meta: {
      title,
    },
  };
};

export const createFormattedDataFromObject = (
  obj: BasicKeyValueObject,
): FormattedDataItem[] => {
  return map(createWebRequestParam, toPairs(obj));
};

export const parseRawString = (str: string): BasicKeyValueObject => {
	return querystring.parse(str) as BasicKeyValueObject;
};

export const stringFromBytesBuffer = (bytes: number[]): string => {
  return String.fromCharCode.apply(null, new Uint8Array(bytes));
};

export const binarytoAscii = (data: string): string => {
  return Buffer.from(data, "base64").toString("ascii");
};

export const formattedJSON = (data: string): string => {
  const payload = binarytoAscii(data);
  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch (e) {
    parsed = {
      context: data,
      error: "Could not parse data",
    };
  }
  const json = JSON.stringify(parsed, null, 4);
  return json;
};

const createWebRequestParam = (tuple: [string, string]): FormattedDataItem => {
  return { label: tuple[0], value: tuple[1], formatting: "string" };
};
