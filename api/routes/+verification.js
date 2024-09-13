import { Server } from "gadget-server";
import { VerifyDiscordRequest } from '../../utils';

/**
 * Route plugin for *
 *
 * @param { Server } server - server instance to customize, with customizations scoped to descendant paths
 *
 * @see {@link https://www.fastify.dev/docs/latest/Reference/Server}
 */
export default async function (server) {
  server.addHook('preHandler', (request, reply, done) => {
    //console.log("RAW REQUEST:",request.raw.url);
    if (request.raw.url !== '/awake') {
      VerifyDiscordRequest(request, reply, process.env.PUBLIC_KEY);
    }
    done();
  })
}
