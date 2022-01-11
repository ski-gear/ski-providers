import { expect } from "chai";
import "mocha";
import { path } from "ramda";
import { GetRequest, PostRequest } from "../../types/Types";
import { Braze } from "../Braze";
import { BrazePostRequestDataBytes } from "./fixtures"

describe("Braze Manager", () => {
  describe("transformer", () => {
    describe("POST Requests", () => {
      const rwrd: PostRequest = {
        url: "http://braze.tld",
        requestType: "POST",
        requestBody: {
          raw: [
            { bytes: BrazePostRequestDataBytes }
          ]
        },
      };
      const transformed = Braze.transformer(rwrd);
      console.log(transformed);
      console.log(transformed[0]);
      it("returns the title: Braze Event", () => {
        expect(path(["meta", "title"], transformed[0])).to.eql("Braze Event");
      });
      it("returns a defined data payload", () => {
        expect(path(["meta", "data"], transformed[0])).to.exist;
      });
    });
  });
});
