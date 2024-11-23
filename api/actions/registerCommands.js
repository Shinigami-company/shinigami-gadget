import { RegisterCommandsGlobalActionContext } from "gadget-server";
import { capitalize, InstallGlobalCommands } from '../../src/utils.js';


import { cmd_register } from '../../src/cmd';

/**
 * @param { RegisterCommandsGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  await InstallGlobalCommands(process.env.APP_ID, cmd_register());
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