import { SETT_CMD_SHOP } from "../sett";
import { items_info } from "../use/item";
import { kira_user_get_shopAlready, kira_user_set_shopAlready } from "../use/kira";

// random
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    let r_float = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return r_float;
  }
}
function randint(r_float_function = () => {}, a_in=0, b_out=1)
{
  return Math.floor(r_float_function() * (Math.abs(b_out) - Math.abs(a_in))) + a_in;
}


//item select
let products_proba = generate_products();

function generate_products()
{
  let proba = 0;
  let products = [];
  for (let itemName in items_info)
  {
    if (items_info[itemName].shopData?.proba)
    {
      proba += items_info[itemName].shopData?.proba;
      products.push({name: itemName, toProba: proba});
    }
  }
  return products;
}
//products_total =


// functions
export async function shop_byable_items(userdata) {
  let now = Date.now();
  let ten = Math.floor(now / (1000*SETT_CMD_SHOP.newItemSeconds));

  let shopAlready = await kira_user_get_shopAlready(userdata.id);
  if (!shopAlready) shopAlready = [];

  let items_seed = new Array(SETT_CMD_SHOP.itemAmount).fill(ten).map((v, i) => v + i);
  let older_index = 0;
  while ((items_seed[0] % SETT_CMD_SHOP.itemAmount) != 0)
  {
    older_index++;
    let last = items_seed.pop();
    items_seed.unshift(last);
  }

  let products = [];
  let new_shopAlready = [];
  let maxProba = products_proba[products_proba.length - 1].toProba;
  for (let seed of items_seed)
  {
    if (shopAlready.includes(seed))
    {
      new_shopAlready.push(seed);
      products.push( { seed, already: true } );
    } else {
      let randfloat = mulberry32(seed);
      let midProba = randfloat()*maxProba;
      for (var i=0; i < products_proba.length && midProba > products_proba[i].toProba; i++) {}
      let product_name = products_proba[i].name;
      
      let product_shopData = items_info[product_name].shopData;
      let product_price;
      if (product_shopData?.price)
      {
        product_price = product_shopData.price;
      } else if (product_shopData?.price_max) {
        product_price = randint(randfloat, product_shopData.price_min, product_shopData.price_max);
      } else {
        product_price = 42;
      }
      products.push( { seed, name: product_name, price: product_price } );
    }
  }

  if (new_shopAlready.length!=shopAlready.length)
    await kira_user_set_shopAlready(userdata.id, new_shopAlready);

  products[older_index].older = true;
  return products;
}


export async function shop_buy_item(userdataId, seed)
{
  let shopAlready = await kira_user_get_shopAlready(userdataId);
  if (!shopAlready) shopAlready = [];
  shopAlready.push(seed);
  await kira_user_set_shopAlready(userdataId, shopAlready);
}

export function shop_get_time_remain()
{
  let now = Date.now();
  let seconds = SETT_CMD_SHOP.newItemSeconds - (Math.floor(now/1000) % SETT_CMD_SHOP.newItemSeconds);
  seconds = Math.ceil(seconds/SETT_CMD_SHOP.newItemRound)*SETT_CMD_SHOP.newItemRound;
  return seconds;
}

export function shop_get_time_next()
{
  let now = Date.now();
  return Math.ceil(now/(SETT_CMD_SHOP.newItemSeconds*1000))*SETT_CMD_SHOP.newItemSeconds;
}