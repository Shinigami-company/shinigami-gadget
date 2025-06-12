import { RegisterCommandsGlobalActionContext } from "gadget-server";
import { InstallGlobalCommands } from '../../src/utils.js';


import { cmd_register } from '../../src/cmd.js';

/**
 * @param { RegisterCommandsGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {

  const register = cmd_register();

  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
  return await DiscordRequest(endpoint, { method: "PUT", body: commands });
  //await InstallGlobalCommands(process.env.APP_ID);
};

//client.user.setActivity('Watching Dev', { type: ActivityType.Watching });


/*
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}


// Command containing options
export const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
};
*/

export const options = { triggers: { api: true } }