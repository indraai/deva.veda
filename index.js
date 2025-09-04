// Copyright (c)2021 Quinn Michaels
// The Rig Veda Deva
import Deva from '@indra.ai/deva';
import pkg from './package.json' with {type:'json'};
const {agent,vars} = pkg.data;
import utils from './utils.js';

import {methods} from './methods/index.js';
import {func} from './func/index.js';

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
  copyright: pkg.copyright,
};

const VEDA = new Deva({
  info,
  agent,
  vars,
  utils,
  listeners: {
    'devacore:question'(packet) {
      const echo = this.methods.echo('veda', 'q', packet);
    },
    'devacore:answer'(packet) {
      const echo = this.methods.echo('veda', 'a', packet);
    }    
  },
  modules: {},
  deva: {},
  func,
  methods,
  onReady(data, resolve) {
    this.prompt(this._messages.ready);
    return resolve(data);
  },
  onError(err, data, reject) {
    this.prompt(this._messages.error);
    console.log(err);
    return reject ? reject(err) : err;
  },
});
export default VEDA
