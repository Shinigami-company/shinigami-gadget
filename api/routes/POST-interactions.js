import { RouteContext } from "gadget-server";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';

//dependancies
import { DiscordRequest } from '../../utils';

//own
import { kira_cmd, kira_error_msg } from '../../src/cmd';
import { sleep } from "../../src/tools.js"

//things


/**
 * Route handler for POST interactions
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */
export default async function route({ request, reply, api, logger, connections }) {
  // Interaction type and data
  const source = request.body;
  const { type, id, token, locale, member, message, channel, guild } = source;//default
  let { data } = source;
  const user = member ? member.user : source.user;


  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return reply.send({ type: InteractionResponseType.PONG });
  }

  // command call for slash  and components
  
  const calling_command =  async commandName => {
      console.log(`
	  route : call command
	  user=${user.id} (${user.username}) command=${commandName} options=${data.options}
	  RESP_URL=webhooks/${process.env.APP_ID}/${token}/messages/@original
	  `);
      const return_patch = await kira_cmd({ source, data, type, id, token, locale, user, message, channel, guild }, commandName);
      // return_patch.method must be 'PATCH'
      
      for (let i=1; i<=10;i+=1)
      {
        try {
          return await DiscordRequest(`webhooks/${process.env.APP_ID}/${token}/messages/@original`, return_patch);
        }
        catch (e) {
          console.debug(`route : catch : interaction ERROR : `,e);
          if (i===0)
            var firstErorr=e;
          if (i>=10)
            throw firstErorr;
          await sleep(1000);
          console.debug(`route : catch : RETRY ${i+1}`);
        }
      }
    }
  
  //reply.send(back);// create the callback with reply obj
  //await DiscordRequest(`interactions/${id}/${token}/callback`,back);// create the callback
  //await DiscordRequest(`webhooks/${process.env.APP_ID}/${token}/messages/@original`,back);// edit the callback

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    return calling_command(data.name);
  }


  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;
    let h_infos = componentId.split(" ");


    //make execute a command
    if (h_infos[0] === 'makecmd') {
      const h_cmd=h_infos[1];
      const h_arg=h_infos[2]?.split("+");

      ///data;//changing the var
      //handle different commands
      switch (h_cmd)
      {
    
        case ("see"):
        {
          //eg:
          //{ id: '1253302180077768806', name: 'see', options: [ { name: 'page', type: 4, value: 10 } ], type: 1 }
          if (h_arg)
            data = { name: 'see', options: [{ name: 'page', type: 4, value: parseInt(h_arg[0]) }] };
          else
            data = { name: 'see' };
        } break;
          
        case ("know"): 
        {
          //eg:
          //{ id: '1263816906717270078', name: 'know', options: [ { name: 'wh', type: 3, value: 'where' }, { name: 'id', type: 4, value: 1000 } ], type: 1 }
          data = { name: 'know', options: [{ name: 'wh', value: h_arg[0] }, {name: 'id', value: parseInt(h_arg[1]) }] };
        } break;
          
        case ("claim"):
        {
          data = { name: 'claim', options: [{ name: 'color', value: parseInt(h_arg[0]) }, {name: 'confirm', value: h_arg[1]==="true"}]};
        } break;
          
        case ("burn"):
        {
          data = { name: 'burn', options: [{name: 'confirm', value: h_arg[0]==="true"}]};
          if (h_arg[1])
          {
            data.options.push();
          }
        } break;
      }

      console.log(` route : components interaction. created data=`, data);
      return calling_command(h_cmd);

    }
    
  // "challenge" command
  /*
  if (name === 'challenge' && id) {
    const userId = user.id;
    // User's object choice
    const objectName = data.options[0].value;

    // Create active game using message ID as the game ID
    await api.games.create({
      messageId: id,
      userId,
      objectName,
    });

    return reply.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        // Fetches a random emoji to send from a helper function
        content: `Rock papers scissors challenge from <@${userId}>`,
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.BUTTON,
                // Append the game ID to use later on
                custom_id: `accept_button_${id}`,
                label: 'Accept',
                style: ButtonStyleTypes.PRIMARY,
              },
            ],
          },
        ],
      },
    });
  }
  */

    /*
    if (componentId.startsWith('accept_button_')) {
      // get the associated game ID
      const gameId = componentId.replace('accept_button_', '');
      // Delete message with token in request body
      const endpoint = `webhooks/${process.env.APP_ID}/${token}/messages/${message.id}`;
      try {
        await reply.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'What is your object of choice?',
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.STRING_SELECT,
                    // Append game ID
                    custom_id: `select_choice_${gameId}`,
                    options: getShuffledOptions(),
                  },
                ],
              },
            ],
          },
        });
        // Delete previous message
        await DiscordRequest(endpoint, { method: 'DELETE' });
      } catch (err) {
        logger.error({ err }, 'Error sending message');
      }
    } else if (componentId.startsWith('select_choice_')) {
      // get the associated game ID
      const gameId = componentId.replace('select_choice_', '');
      const activeGame = await api.games.findFirst({
        filter: {
          messageId: {
            equals: gameId,
          },
        },
      });

      if (activeGame) {
        // Get user ID and object choice for responding user
        const userId = user.id;
        const objectName = data.values[0];
        // Calculate result from helper function
        const resultStr = getResult(activeGame, {
          userId,
          objectName,
        });

        // Remove game from storage
        await api.games.delete(activeGame.id)
        // Update message with token in request body
        const endpoint = `webhooks/${process.env.APP_ID}/${token}/messages/${message.id}`;

        try {
          // Send results
          await reply.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: resultStr },
          });
          // Update ephemeral message
          await DiscordRequest(endpoint, {
            method: 'PATCH',
            body: {
              content: 'Nice choice ' + getRandomEmoji(),
              components: [],
            },
          });
        } catch (err) {
          logger.error({ err }, 'Error sending message');
        }
      }
    }
    */
  }
}
