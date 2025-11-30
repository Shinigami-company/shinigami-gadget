import { api } from "gadget-server";

const destroySaveCheck = new FinalizationRegistry<{ type: string, id: number, saveDictionnary: {[id: string]: any} }>((info) => {
  console.log("suieundvuvuvuefzuefznueznfzeofeznofzefezno");
  if (info.saveDictionnary.length > 0) {
    console.error("suieundvuvuvuefzuefznueznfzeofeznofzefezno");
    throw new Error(`Object [${info.type}] id [${info.id}] was garbage collected with elements not saved:`, info.saveDictionnary);
  }
});

export class BaseInterface {

  // construct with raw model
  protected id : number;
  protected data : any;
  private saveDictionnary : {[id: string]: any} = {};
  
  constructor(userdata : any) {
    this.id = userdata.id;
    this.data = userdata;
    destroySaveCheck.register(this, { type: typeof(this), id: this.id, saveDictionnary: this.saveDictionnary });
  }

  public async save() {
    await api.KiraUsers.update(this.id, this.saveDictionnary);
    this.saveDictionnary = {};
  }
  
  public saved() : boolean {
    return (this.saveDictionnary.length === 0);
  }
  
  public tosave(key : string, value : any) {
    this.saveDictionnary[key] = value;
  }
}