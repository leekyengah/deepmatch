import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { apiError, httpStatusFor } from "./errors";

describe("apiError envelope", () => {
  it("builds unified error shape", () => {
    const body = apiError(
      "RESOURCE_NOT_ACCESSIBLE",
      "This content is not accessible.",
      "req-1",
      "errors.RESOURCE_NOT_ACCESSIBLE",
    );
    assert.equal(body.error.code, "RESOURCE_NOT_ACCESSIBLE");
    assert.equal(body.error.request_id, "req-1");
    assert.equal(body.error.key, "errors.RESOURCE_NOT_ACCESSIBLE");
    assert.equal(httpStatusFor("UNAUTHENTICATED"), 401);
    assert.equal(httpStatusFor("RESOURCE_NOT_ACCESSIBLE"), 403);
  });
});
