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
    console.log(res.status);
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


// other usefull things

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    return await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}