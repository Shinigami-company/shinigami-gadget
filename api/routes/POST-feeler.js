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
  const {type, event} = source;


  /**
   * Handle verification requests
   */
  console.debug(`feeler : something. source=`,source);

  if (type === 0) {//that not InteractionType.PING ! (0!=1)
    return reply.send({ type: InteractionResponseType.PONG });
  }

  const { data, timestamp } = event;
  const { guild, user, integration_type, scopes } = data;

  
  let guild_with_members={};
  try {
    guild_with_members=await DiscordRequest(
      `guilds/${guild.id}?with_counts=1`,
      {
        method: "GET",
      }
    ).then((res) => res.json());
  } catch (error) {
    console.error(`kira : catch cant fetch guild count : ${error}`);
  }

  const all = { user, guild, presence_count: guild_with_members?.approximate_presence_count, member_count: guild_with_members?.approximate_member_count };
  await webhook_reporter.hall.post(
    user?.locale ? user?.locale : "en",
    all,
    { author: true },
    user.accent_color
    //15261768 //yellow
  );
  
}

export default route;
