import { checkSeela } from "./checker.js";
import { requireConfig } from "./config.js";

requireConfig();

const result = await checkSeela();
console.log(JSON.stringify(result, null, 2));
