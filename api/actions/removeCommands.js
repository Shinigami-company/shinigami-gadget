import { RemoveCommandsGlobalActionContext } from "gadget-server";
import { DiscordRequest } from "../../src/utils.js";
import { sleep } from "../../src/tools.js";
import { TEST_COMMAND, CHALLENGE_COMMAND } from "./registerCommands";

/**
 * @param { RemoveCommandsGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  //  /applications/{application.id}/commands
  const appId = process.env.APP_ID;

  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  {
    const resp = await DiscordRequest(endpoint, { method: 'GET' });
    const commands = await resp.json();

    //const commandIds = commands.filter(command => command.name === TEST_COMMAND.name || command.name === CHALLENGE_COMMAND.name).map(command => command.id);
    const commandIds = commands.map(command => command.id);
    for (const commandId of commandIds) {
      let retry = 3;
      while (retry > 0)
      {
        retry *=-1;
        try {
          await DiscordRequest(`${endpoint}/${commandId}`, { method: "DELETE" });
        } catch (e) {
          retry *= -1;
          retry -= 1;
          if (retry<=0)
          {
            throw e;
          }
          await sleep(3000);//! when rate limited
        }
      }
    }
  }
};

export const options = { triggers: { api: true } }