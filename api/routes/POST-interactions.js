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
import { kira_cmd, kira_error_msg } from '../../src/cmd';
import { sleep, times_precise_string_from_int } from "../../src/tools.js";

//things
const maxError = 1;


class ClockTime {
  constructor()
  {
    this.epoch=Date.now();
    this.data={};
  }
  emit(name="time", save) {
    const time_ms=Date.now()-this.epoch;
    if (save)
      this.write(name, time_ms)
    console.debug(`clock : ${name} = `,times_precise_string_from_int(time_ms));
  }

  write(id="time", value_ms) {
    this.data[id]=value_ms;
  }
  read(id="time") {
    return this.data[id];
  }
}

/**
 * Route handler for POST interactions
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */
export default async function route({ request, reply, api, logger, connections }) {
  const clock=new ClockTime();
  clock.emit("RECIEVE");
  // Interaction type and data
  const source = request.body;
  const timespam = request.headers['x-signature-timestamp'];
  const { type, id, token, locale, member, message, channel, guild } = source;//default
  let { data } = source;
  const user = member ? member.user : source.user;

  //console.log("1:",request.headers);
  //console.log("2:",);
  //console.log("3:",request.received);

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
      
      return await kira_cmd({ source, timespam, data, type, id, token, locale, user, message, channel, guild, clock }, commandName);
      
      /*
      const return_patch = await kira_cmd({ source, data, type, id, token, locale, user, message, channel, guild }, commandName);
      // return_patch.method must be 'PATCH'
      if (!return_patch) return;

      for (let i=1; i<=maxError;i+=1)
      {
        try {
          return await DiscordRequest(`webhooks/${process.env.APP_ID}/${token}/messages/@original`, return_patch);
        }
        catch (e) {
          console.debug(`route : catch : interaction ERROR :\n`,e);
          if (i===1)
            var firstErorr=e;
          if (i>=maxError)
            throw firstErorr;
          await sleep(1000);
          console.debug(`route : catch : RETRY ${i+1}`);
        }
      }
      */
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
  if (type === InteractionType.MESSAGE_COMPONENT || type === InteractionType.MODAL_SUBMIT) {
    // custom_id set in payload when sending message component
    
    console.debug(`route : components interaction. origin data=`, data);
    
    let componentId = data.custom_id;
    componentId=componentId.replace(/<value>/,(data?.values) ? data?.values[0] : undefined);
    let h_infos = componentId.split(" ");


    //make execute a command
    if (h_infos[0] === 'makecmd') {
      const h_cmd=h_infos[1];
      const h_arg=h_infos[2]?.split("+");

      ///data;//changing the var
      //handle different commands
      switch (h_cmd)
      {

        //--InteractionType.MESSAGE_COMPONENT--

        case ("feedback_form"):
        {
          data = { name: 'feedback_form', options: [{ name: 'want', value: h_arg[0]==="true" }] };
        } break;

        case ("see_edit"):
        {
          if (h_arg.length>1)
            data = { name: 'see_edit', options: [{ name: 'bookId', type: 4, value: parseInt(h_arg[0]) }, { name: 'page', type: 4, value: parseInt(h_arg[1]) }] };
          else
            data = { name: 'see_edit', options: [{ name: 'bookId', type: 4, value: parseInt(h_arg[0]) }]};
        } break;

        case ("see"):
        {//old
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

        case ("drop"):
        {
          data = {name: 'drop', options: [{name:'value', value: parseInt(h_arg[0])}]};
        } break;
        
        case ("trick_resp_eph"): {}
        case ("trick_resp_edit"): {}
        case ("trick_resp"):
        {
          data = {name: h_cmd, options: [{name:'trick_index', value: h_arg[0]}, {name: 'trick_step', value: h_arg[1]}, {name: 'trick_pile', value: h_arg[2]}]};
        } break;

        //--InteractionType.MESSAGE_COMPONENT--
        case ("feedback"): 
        {
          const get_letter = data.components[0].components[0].value;
          const get_ps = data.components[1].components[0].value;
          data = {name: 'feedback', options: [{name:'letter', value: get_letter}, {name:'last', value: get_ps}]}
        } break;

        default: {
          throw Error(`[${h_cmd}] does not exist in makecmd`);
        } break;
      }

      console.debug(`route : components interaction. created data=`, data);
      return calling_command(h_cmd);

    }
  }
}
