//  veda exports 
import agent from './agent.json' with {type:'json'};
import vars from './vars.json' with {type:'json'};
import {data} from './rigveda/index.js';

export default {
  agent: agent.DATA,
  vars: vars.DATA,
  data,
}
