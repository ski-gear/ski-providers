import { expect } from "chai";
import "mocha";
import { path } from "ramda";
import { GetRequest, PostRequest } from "../../types/Types";
import { AdobeAnalyticsAppMeasurement } from "../AdobeAnalyticsAppMeasurement";
import { AdobePostRequestDataBytes } from './fixtures'

describe("Adobe Analytics Manager", () => {
  describe("transformer", () => {
    describe("POST Requests", () => {
      const rwrd: PostRequest = {
        url: "http://someurl.tld",
        requestType: "POST",
        requestBody: {
          raw: [
            { bytes: AdobePostRequestDataBytes }
          ]
        },
      };
      const transformed = AdobeAnalyticsAppMeasurement.transformer(rwrd);

      it("returns the label Unknown Event", () => {
        expect(path(["meta", "title"], transformed[0])).to.eql("Page Load (event19:1528284525qjrci3uu,event10:1528284525qy6wdtcx,event4:1528284525qy6wdtcx,event12)");
      });
    });

    describe("GET Requests", () => {
      describe("Title", () => {
        describe("When the data contains 'pe' param", () => {
          describe("When no events are populated", () => {
            const rwrd: GetRequest = {
              url: "http://someurl.tld",
              requestType: "GET",
              requestParams: { pe: "lnk_o", pev2: "personalised_impression" },
            };
            const transformed = AdobeAnalyticsAppMeasurement.transformer(rwrd);
            it("returns the label personalised_impression", () => {
              expect(path(["meta", "title"], transformed[0])).to.contain("personalised_impression");
            });
          });

          describe("When an event is populated", () => {
            const rwrd: GetRequest = {
              url: "http://someurl.tld",
              requestType: "GET",
              requestParams: { pe: "link_o", events: "event1" },
            };
            const transformed = AdobeAnalyticsAppMeasurement.transformer(rwrd);
            it("returns the correct event", () => {
              expect(path(["meta", "title"], transformed[0])).to.eql("event1");
            });
          });
        });

        describe("When the data does not contain 'pe' param", () => {
          const rwrd: GetRequest = {
            url: "http://someurl.tld",
            requestType: "GET",
            requestParams: { pet: "link_o" },
          };
          const transformed = AdobeAnalyticsAppMeasurement.transformer(rwrd);
          it("returns the Page Load label", () => {
            expect(path(["meta", "title"], transformed[0])).to.eql("Page Load");
          });

          describe("and contains events data", () => {
            const rwrd: GetRequest = {
              url: "http://someurl.tld",
              requestType: "GET",
              requestParams: { pet: "link_o", events: "event1" },
            };
            const transformed = AdobeAnalyticsAppMeasurement.transformer(rwrd);
            it("returns Page Load label with events", () => {
              expect(path(["meta", "title"], transformed[0])).to.eql("Page Load (event1)");
            });
          });
        });
      });

      describe("Evars, Props, and Lists", () => {
        describe("When an evar/v property is present with the correct category", () => {
          const rwrd: GetRequest = {
            url: "http://someurl.tld",
            requestType: "GET",
            requestParams: { v1: "test", evar2: "test2" },
          };
          const transformed = AdobeAnalyticsAppMeasurement.transformer(rwrd);
          it("sets the label with a readble prefix - eVar", () => {
            expect(path(["data", 0, "label"], transformed[0])).to.eql("eVar1");
            expect(path(["data", 0, "category"], transformed[0])).to.eql("Evars, Props, and Lists");
            expect(path(["data", 1, "label"], transformed[0])).to.eql("eVar2");
          });
        });

        describe("When an prop/c property is present with the correct category", () => {
          const rwrd: GetRequest = {
            url: "http://someurl.tld",
            requestType: "GET",
            requestParams: { c1: "test", prop2: "test2" },
          };
          const transformed = AdobeAnalyticsAppMeasurement.transformer(rwrd);
          it("sets the label with a readble prefix - eVar", () => {
            expect(path(["data", 0, "label"], transformed[0])).to.eql("Prop1");
            expect(path(["data", 0, "category"], transformed[0])).to.eql("Evars, Props, and Lists");
            expect(path(["data", 1, "label"], transformed[0])).to.eql("Prop2");
          });
        });

        describe("When an list/l property is present with the correct category", () => {
          const rwrd: GetRequest = {
            url: "http://someurl.tld",
            requestType: "GET",
            requestParams: { l1: "test", list2: "test2" },
          };
          const transformed = AdobeAnalyticsAppMeasurement.transformer(rwrd);
          it("sets the label with a readble prefix - list", () => {
            expect(path(["data", 0, "label"], transformed[0])).to.eql("List1");
            expect(path(["data", 0, "category"], transformed[0])).to.eql("Evars, Props, and Lists");
            expect(path(["data", 1, "label"], transformed[0])).to.eql("List2");
          });
        });

        describe("When a label is present that needs replacing", () => {
          const rwrd: GetRequest = {
            url: "http://someurl.tld",
            requestType: "GET",
            requestParams: { ns: "tests" },
          };
          const transformed = AdobeAnalyticsAppMeasurement.transformer(rwrd);
          it("sets the correct label", () => {
            expect(path(["data", 0, "label"], transformed[0])).to.eql("Visitor namespace");
          });
        });
      });
    });
  });
});
