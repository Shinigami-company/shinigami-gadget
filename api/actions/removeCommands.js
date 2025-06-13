import { RemoveCommandsGlobalActionContext } from "gadget-server";
import { DiscordRequest } from "../../src/utils.js";
import { sleep } from "../../src/tools.js";
import { TEST_COMMAND, CHALLENGE_COMMAND } from "./registerCommands";

/**
 * @param { RemoveCommandsGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  //moved at kira.js
};

export const options = { triggers: { api: true } }