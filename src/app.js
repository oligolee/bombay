import DotEnv from "dotenv";
import Hapi from "@hapi/hapi";
import { Event } from "./resources/Event";
import { GithubHooksAuth } from "./auth/GithubHooksAuth";

DotEnv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.LISTEN_PORT,
    host: process.env.LISTEN_HOST,
  });

  server.auth.scheme(GithubHooksAuth.schemeName, GithubHooksAuth.scheme);
  server.auth.strategy(
    GithubHooksAuth.strategyName,
    GithubHooksAuth.schemeName,
    { apiKey: process.env.API_KEY }
  );
  server.auth.default(GithubHooksAuth.strategyName);
  server.route(Event.create);
  console.log("Starting server on %s....", server.info.uri);
  server.start();
  return server;
};

init()
  .then((server) => {
    console.log(`Server listening on ${server.info.uri}`);
    // handling server.log() with stdout and stderr
    /*
    server.events.on("log", (event, tags) => {
      console.info(`Recieved Server#log with tags ${tags}`);
      if (tags.ERROR) {
        console.error(event);
      } else if(tags.DEBUG) {
        console.debug(event);
      }
    });
    */
    // handling request.log() to stdout and stderr
    /*
    server.events.on("request", (event, tags) => {
      console.info(`Recieved Request#log with tags ${tags}`);
      if (tags.ERROR) {
        console.error(event);
      } else if(tags.DEBUG) {
        console.debug(event);
      }
    });
    */
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
