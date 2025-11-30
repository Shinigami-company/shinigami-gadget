import { api } from "gadget-server";

const destroySaveCheck = new FinalizationRegistry<{ this: BaseInterface, id: number, saveDictionnary: {[id: string]: any}, saved: () => {} }>((info) => {
  console.log("suieundvuvuvuefzuefznueznfzeofeznofzefezno", info.saveDictionnary);
  if (!info.saved()) {
    console.error("suieundvuvuvuefzuefznueznfzeofeznofzefezno");
    throw new Error(`Object [${info.this}] type [${typeof info.this}] id [${info.id}] was garbage collected with elements not saved:`, info.saveDictionnary);
  }
});

export class BaseInterface {

  // construct with raw model
  protected id : number;
  protected data : any;
  private saveDictionnary : {[id: string]: any} = {};
  protected static get apiClass(): any {return {};}
  
  constructor(userdata : any) {
    this.id = userdata.id;
    this.data = userdata;
    destroySaveCheck.register(this, { this: this, id: this.id, saveDictionnary: this.saveDictionnary, saved: this.saved });
  }

  public async save() {
    await (this.constructor as typeof BaseInterface).apiClass.update(this.id, this.saveDictionnary);
    this.saveDictionnary = {};
  }
  
  public saved() : boolean {
    return (this.saveDictionnary.length === 0);
  }
  
  public tosave(key : string, value : any) {
    this.saveDictionnary[key] = value;
  }
}