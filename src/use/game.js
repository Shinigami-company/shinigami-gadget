import { api } from "gadget-server";

/*
export async function kira_game_coin_step_get(gameId)
{
  return await api.KiraGameCoin.findOne(gameId).then(obj => obj.step);
}
*/

export async function kira_game_coin_get(gameId)
{
  return api.KiraGameCoin.maybeFindOne(gameId);
}

export async function kira_game_coin_clean()
{
  const date=new Date();
  date.setSeconds(date.getSeconds() + 600);
  let all_datas=await api.KiraGameCoin.findMany({
    filter: [
      {
        createdAt: {
          before: date.toISOString()
        },
      },
    ],
    select: {id: true}
    }).then(list => list.map(obj => obj.id));
  if (!all_datas) return;
  console.log("game : clean coin games data = ",all_datas);
  await api.KiraGameCoin.bulkDelete(all_datas);
}

//step 1
export async function kira_game_coin_create(bet, user1Id)
{
  return await api.KiraGameCoin.create({bet, user1Id, step: 2});//forward
}

//step 2
export async function kira_game_coin_pick_user(gameId, user2Id)
{
  return await api.KiraGameCoin.update(gameId, {user2Id, step: 3});//forward
}

//step 3
export async function kira_game_coin_pick_side(gameId, user1Side, user2Side)
{
  return await api.KiraGameCoin.update(gameId, {user1Side, user2Side, step: ((user1Side>0 && user2Side>0) ? 4 : 3)});//foward if
}

//step 4
export async function kira_game_coin_pop(gameId)
{//throw error if cant pop
  const obj=await api.KiraGameCoin.maybeFindOne(gameId);
  if (!obj) return obj;
  await api.KiraGameCoin.delete(gameId);
  return obj;
}

//force del
export async function kira_game_coin_fail(gameId)
{//throw error if cant delete
  await api.KiraGameCoin.delete(gameId);
}