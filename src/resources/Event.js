import { GithubHooksAuth } from "../auth/GithubHooksAuth";

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
      const payload = request.payload;
      return h
        .response("created")
        .type("text/plain")
        .header("X-Custom", "some-value")
        .code(201);
    },
  },
};
