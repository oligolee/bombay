import { GithubHooksAuth } from "../auth/GithubHooksAuth";
import { Storage } from "@google-cloud/storage";
import { Readable, pipeline } from "stream";
import util from 'util';


const GH_DELIVERY_HDR = "x-github-delivery";
const _pipeline = util.promisify(pipeline);

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
    handler: async function (request, h) {
      try {
        const storage = new Storage();
        const srcBucket = storage.bucket("kutuka-bombay");
        const ghDeliveryId = request.headers[GH_DELIVERY_HDR];
        const newFileName = `src-events-raw/gh_event_${ghDeliveryId}.json`;
        const newFile = srcBucket.file(newFileName);

        const payloadAsStream = Readable.from(JSON.stringify(request.payload));
        const newFileAsStream = newFile.createWriteStream();

        await _pipeline(payloadAsStream, newFileAsStream);
        /*payloadAsStream.pipe(newFileAsStream)
          .on("error", function (err) {
            console.error(err);
            //return h.response("Internal error").code(500);
            newFileAsStream.end();

          })
          .on("finish", function () {
            console.log("Finished writing event file");
          });
          */
          return h.response("created").type("text/plain").code(201);
      } catch (err) {
        console.error(err);
        return h.response("Internal error").code(500);
      }
    },
  },
};
