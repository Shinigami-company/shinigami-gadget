import { RegisterCommandsGlobalActionContext } from "gadget-server";
import { capitalize, InstallGlobalCommands } from '../../src/utils.js';


import { cmd_register } from '../../src/cmd';

/**
 * @param { RegisterCommandsGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  //moved at kira.js
};

export const options = { triggers: { api: true } };