import { RouteContext } from "gadget-server";

/**
 * Route handler for GET awake
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */
export default async function route({ request, reply, api, logger, connections }) {
  return reply.send({message: "bot awake", code:200});
}
