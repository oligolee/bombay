import { GithubHooksAuth } from "../auth/GithubHooksAuth";
import { Storage } from "@google-cloud/storage";
import { Readable } from "stream";

const GH_DELIVERY_HDR = "x-github-delivery";

export const Event = {
  create: {
    method: "POST",
    path: "/event",
    options: {
      description: "A Github Webhook Event",
      auth: {
        strategy: GithubHooksAuth.strategyName,
        payload: true, // MANDATORY to activate the payload validation auth mechanism for github webhooks
      },
    },
    handler: function (request, h) {
      let wasFileWritten = false;
      try {
        const storage = new Storage();
        const srcBucket = storage.bucket("kutuka-bombay");
        const ghDeliveryId = request.headers[GH_DELIVERY_HDR];
        const newFileName = `src-events-raw/gh_event_${ghDeliveryId}`;
        const newFile = srcBucket.file(newFileName);

        Readable.from(JSON.stringify(request.payload))
          .pipe(newFile.createWriteStream())
          .on("error", function (err) {
            wasFileWritten = false;
            console.error(err);
          })
          .on("finish", function () {
            wasFileWritten = true;
            console.log("Finished writing event file");
          });
      } catch (err) {
        console.error(err);
      }
      if (wasFileWritten) {
        return h.response("created").type("text/plain").code(201);
      } else {
        return h.response("Internal error").code(500);
      }
    },
  },
};
