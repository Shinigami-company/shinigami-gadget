import { RouteContext } from "gadget-server";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';

//dependancies
import { DiscordRequest } from '../../src/utils.js';

//own
import { webhook_reporter } from '../../src/use/post.js';

/**
 * Route handler for POST feeler
 *
 * @type { RouteHandler } route handler - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route = async ({ request, reply, api, logger, connections }) => {


  // Interaction type and data
  const source = request.body;
  const { data, timestamp, type } = source.event;
  const { guild, user, integration_type, scopes } = data;


  /**
   * Handle verification requests
   */
  console.log(`feeler : something. source=`,source);

  if (type === InteractionType.PING) {
    return reply.send({ type: InteractionResponseType.PONG });
  }

  
  console.log("feeler : OK. user=",user, " guild=", guild);

  const all = { user, guild };
  await webhook_reporter.hall.post(
    user?.locale ? user?.locale : "en",
    all,
    { author: true },
    16711680
  );
  
}

export default route;
