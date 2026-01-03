"use strict";
// ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:49633069290486712918 LICENSE.md

// The Rig Veda Deva
import Deva from '@indra.ai/deva';
import pkg from './package.json' with {type:'json'};
const {agent,vars} = pkg.data;
import utils from './utils.js';

import {methods} from './methods/index.js';
import {func} from './func/index.js';

// Devas
import indu from '@indra.ai/deva.indu';
import indra from '@indra.ai/deva.indra';
import soma from '@indra.ai/deva.soma';
// import householder from '/Users/quinnmichaels/Dev/deva.space/devas/deva.householder/index.js';
// import brahmana from '/Users/quinnmichaels/Dev/deva.space/devas/deva.brahmana/index.js';
// import kshatriya from '/Users/quinnmichaels/Dev/deva.space/devas/deva.kshatriya/index.js';
// import vaisya from '/Users/quinnmichaels/Dev/deva.space/devas/deva.vaisya/index.js';
// import sudra from '/Users/quinnmichaels/Dev/deva.space/devas/deva.sudra/index.js';

// set the __dirname
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

const info = {
  id: pkg.id,
  name: pkg.name,
  describe: pkg.description,
  version: pkg.version,
  dir: __dirname,
  url: pkg.homepage,
  git: pkg.repository.url,
  bugs: pkg.bugs.url,
  author: pkg.author,
  license: pkg.license,
  VLA: pkg.VLA,
  copyright: pkg.copyright,
};

const VEDA = new Deva({
  info,
  agent,
  vars,
  utils,
  listeners: {},
  modules: {},
  devas: {
    indu,
    indra,
    soma,
  },
  func,
  methods,
  onInit(data, resolve) {
    const {personal} = this.license(); // get the license config
    const agent_license = this.info().VLA; // get agent license
    const license_check = this.license_check(personal, agent_license); // check license
    // return this.start if license_check passes otherwise stop.
    return license_check ? this.start(data, resolve) : this.stop(data, resolve);
  }, 
  onReady(data, resolve) {
    const {VLA} = this.info();
    this.prompt(`${this.vars.messages.ready} > VLA:${VLA.uid}`);
    this.action('resolve', `onReady:${data.id.uid}`);
    return resolve(data);
  },
  onError(err, data, reject) {
    this.prompt(this._messages.error);
    console.log(err);
    return reject ? reject(err) : err;
  },
});
export default VEDA
