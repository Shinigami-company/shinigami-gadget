import { DiscordRequest } from "../utils.js";
import { translate } from "../lang.js";


class Report {
  constructor(key, webhook_url, general_shown_filed={}, default_color=null) {
    this.translate_key=key;//the key for lang
    this.webhook_url=webhook_url;//the webhook to send
    this.general_shown_filed=general_shown_filed;//dictionnary for
    this.default_color=default_color;//default embed color
  }

  async post(lang, translate_replace, override_shown_filed={}, embed_color=null) {
    
    const if_fill_field = filed_key => (
      override_shown_filed[filed_key]//if overried say to do
      || (override_shown_filed[filed_key]!==false//overried not say
          && this.general_shown_filed[filed_key])//genral say to do
          //&& !(this.general_shown_filed[filed_key]===false))//genral not say or say to
    );

    const do_fill_field = filed_key => (if_fill_field(filed_key)) ? translate(lang, `post.${this.translate_key}.${filed_key}`, translate_replace) : null;

    const msg = 
    {
      method: "POST",
      body: {
        content: do_fill_field('content'),
        embeds: (!if_fill_field('embed')) ? null :
        [{
          title: do_fill_field('title'),
          description: do_fill_field('description'),
          fields: [],//no fields for now
          author: {
            name: do_fill_field('author'),
            icon_url: do_fill_field('author.icon'),
          },
          color: (embed_color===null) ? this.default_color : embed_color,
          footer: {
            text: do_fill_field('footer')
          }
        }]
      },
    }
    
    await DiscordRequest(
    this.webhook_url,msg);
  }
};


const reporter_list = ['feedback', 'error', 'newbi'];

export const webhook_reporter = (() => {
  let dic={}
  for (const v of reporter_list)
  {
    dic[v] = new Report(
      v, process.env[`webhook_${v}`],
      { 'content': false, 'embed': true, 'title': true, 'description': true, 'author': true, 'author.icon': true, 'footer': true } 
    )

  }
  return dic;
})();