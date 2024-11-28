import { verifyKey } from 'discord-interactions';

export function VerifyDiscordRequest(request, reply, clientKey) {
  const signature = request.headers['x-signature-ed25519'];
  const timestamp = request.headers['x-signature-timestamp'];

  const isValidRequest = verifyKey(JSON.stringify(request.body), signature, timestamp, clientKey);

  if (!isValidRequest) {
    reply.status(401).send('Bad request signature');
    throw new Error('Bad request signature');
  }
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(`DiscordRequest failure : url=`,url,`\nmethod=`,options.method,`statu=`,res.status);//code
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function DiscordUserById(f_UserId)
{
  //https://discord.com/developers/docs/resources/user#get-user
  //Get User   (GET)   /users/{user.id}
  //Returns a user object for a given user ID.
  const this_resp = await DiscordRequest("users/" + f_UserId,{ method: 'GET' });

  const this_commands = await this_resp.json();
  return this_commands;
}

export async function DiscordUserOpenDm(f_UserId)
{
  //https://discord.com/developers/docs/resources/user#get-user
  //Get User   (GET)   /users/{user.id}
  //Returns a user object for a given user ID.
  const this_resp = await DiscordRequest(`users/@me/channels`, {
        method: "POST",
        body: {
          recipient_id: f_UserId,
        },
      });

  const this_channel = await this_resp.json();
  return this_channel.id;
}

export async function DiscordMessageChanged(f_message, f_webhook_token=undefined)
{
  //https://discord.com/developers/docs/resources/user#get-user
  //Get User   (GET)   /users/{user.id}
  //Returns a user object for a given user ID.
  const this_resp = (f_webhook_token) ?
  await DiscordRequest(`/webhooks/${process.env.APP_ID}/${f_webhook_token}/messages/${f_message.id}`,{ method: 'GET' })//using https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
  : await DiscordRequest(`/channels/${f_message.channel_id}/messages/${f_message.id}`,{ method: 'GET' })//using https://discord.com/developers/docs/resources/message#get-channel-message

  const this_message = await this_resp.json();
  console.log(`hi : DiscordMessageChanged between last=${f_message.edited_timestamp} and now=${this_message.edited_timestamp}`);
  console.log(f_message);
  console.log(this_message);
  return (f_message.edited_timestamp!==this_message.edited_timestamp);
}


// other usefull things

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
  return await DiscordRequest(endpoint, { method: 'PUT', body: commands });
}