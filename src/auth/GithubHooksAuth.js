import Crypto from "crypto";
import Boom from "@hapi/boom";

const HAPI_AUTH_SCHEME_NAME = "gh-webhooks-auth";
const HAPI_AUTH_STRATEGY_NAME = "github-hooks-secret";
const GH_SIGN_HEADER = "x-hub-signature";

export const GithubHooksAuth = {
  strategyName: HAPI_AUTH_STRATEGY_NAME,
  schemeName: HAPI_AUTH_SCHEME_NAME,
  scheme: function (server, options) {
    return {
      options: {
        payload: true,
      },
      authenticate: async function (request, h) {
        const ghSignature = request.headers[GH_SIGN_HEADER];
        if (!ghSignature) {
          throw Boom.unauthorized(null, HAPI_AUTH_SCHEME_NAME);
        }
        const credentials = request.headers;
        return h.authenticated({ credentials });
      },
      payload: async function (request, h) {
        let isValidSignature = false;
        let ghSignature = "";
        let { apiKey } = options;
        if (!apiKey) {
          /*request.log(
            "ERROR",
            `Authentication failed for client request with digest: ${ghSignature}`
          );*/
          console.error(`Authentication failed for client request with digest: ${ghSignature}`);
          throw Boom.unauthorized(null, HAPI_AUTH_SCHEME_NAME);
        }
        try {
          const ghSignature = request.auth.credentials[GH_SIGN_HEADER];
          /*request.log("DEBUG",
            `Authenticating client request with digest: ${ghSignature}`
          );*/
          console.debug(`Authenticating client request with digest: ${ghSignature}`);
          const srcDigest = Buffer.from(ghSignature, "utf8");
          const hmac = Crypto.createHmac("sha1", apiKey);
          hmac.update(JSON.stringify(request.payload));
          const payloadSignatureHex = hmac.digest("hex");
          const payloadSignature = Buffer.from(payloadSignatureHex, "utf8");
          const ghPrefix = Buffer.from("sha1=", "utf8");
          const serverDigest = Buffer.concat([ghPrefix, payloadSignature]);

          isValidSignature = Crypto.timingSafeEqual(srcDigest, serverDigest);
        } catch (error) {
          /*request.log(
            "ERROR",
            `Authentication failed for client request with digest: ${ghSignature}`
          );*/
          console.error(`Authentication failed for client request with digest: ${ghSignature}`);
          throw Boom.unauthorized(null, HAPI_AUTH_SCHEME_NAME);
        }

        if (!isValidSignature) {
          /*request.log(
            "ERROR",
            `Authentication failed for client request with digest: ${ghSignature}`
          );*/
          console.error(`Authentication failed for client request with digest: ${ghSignature}`);
          throw Boom.unauthorized(null, HAPI_AUTH_SCHEME_NAME);
        }

        /*request.log("DEBUG",
          `Authentication succeded for client request with digest: ${ghSignature}`
        );*/
        console.debug(`Authentication succeded for client request with digest: ${ghSignature}`);
        return h.continue;
      },
    };
  },
};
