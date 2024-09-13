import { Client } from "@gadget-client/typethis";

export const api = new Client({ environment: window.gadgetConfig.environment });
