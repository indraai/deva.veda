// Copyright (c)2021 Quinn Michaels
// The Rig Veda Deva
const fs = require('fs');
const path = require('path');
const package = require('./package.json');
const info = {
  id: package.id,
  name: package.name,
  describe: package.description,
  version: package.version,
  url: package.homepage,
  git: package.repository.url,
  bugs: package.bugs.url,
  author: package.author,
  license: package.license,
  copyright: package.copyright,
};

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).DATA;

const Deva = require('@indra.ai/deva');
const VEDA = new Deva({
  info,
  agent: {
    uid: agent.uid,
    key: agent.key,
    name: agent.name,
    describe: agent.describe,
    prompt: agent.prompt,
    voice: agent.voice,
    profile: agent.profile,
    translate(input) {
      return input.trim();
    },
    parse: require('./_parse'),
  },
  vars,
  listeners: {},
  modules: {},
  deva: {},
  func: {

    // code from old open ai work on that deva.
    // async hymns() {
    //   const book = await this.question(`#veda book ${this.vars.veda.book}`);
    //   this.vars.veda.hymns = book.a.data.map(b => b.key);
    //   return this.vars.veda.hymns;
    // },
    // hymn() {
    //   if (!this.vars.veda.hymns.length) this.func.hymns();
    //   return this.vars.veda.hymns.shift();
    // }


    /**************
    func: books
    params: packet
    describe: Return a listiig of the Rig Veda Books.
    ***************/
    books(packet) {
      return new Promise((resolve, reject) => {
        if (!packet) return reject('NO PACKET');
        const {title, describe, data} = require(path.join(__dirname, 'json', 'index.json'));
        if (!data) return reject(`${this.vars.messages.error} NO BOOK`);
        const _text = [
          `## ${title}`,
          `p: ${describe}`,
        ];
        // loop over the data and format it into a feecting command string
        data.forEach(book => {
          _text.push(`cmd[${book.title}]:#${this.agent.key} book ${book.key}`);
        });
        this.question(`#feecting parse:${this.agent.key} ${_text.join('\n')}`).then(feecting => {
          return resolve({
            text:feecting.a.text,
            html:feecting.a.html,
            data,
          });
        }).catch(err => {
          return this.error(err, packet, reject);
        });
      })
    },

    /***********
      func: book
      params: packet
      describe: The book function calls the public facing api to get a listing of books to list to the user. originally this file came from sacred-texts.com but was migrated to indra.church with a json api.
    ***********/
    book(packet) {
      return new Promise((resolve, reject) => {
        if (!packet) return reject('NO PACKET');
        const book = packet.q.text.length < 2 ? `0${packet.q.text}` : packet.q.text;
        const {title, describe, data} = require(path.join(__dirname, 'json', `${book}.json`));
        const _text = [
          `## ${title}`,
          `p: ${describe}`,
        ]
        data.forEach(hymn => {
          _text.push(`cmd[${hymn.title}]:#${this.agent.key} view ${hymn.key}`)
        });
        this.question(`#feecting parse:${this.agent.key} ${_text.join('\n')}`).then(feecting => {
          return resolve({
            text:feecting.a.text,
            html:feecting.a.html,
            data,
          });
        }).catch(err => {
          return this.error(err, packet, reject);
        });
      });
    },

    /**************
    func: view
    params: packet
    describe: The View function returns a specific hymn from one of the Books.
    ***************/
    hymn(h) {
      return new Promise((resolve, reject) => {
        if (!h) return reject(this._messages.notext);
        const hymnPath = path.join(__dirname, 'json', 'hymns', `${h}.json`);
        const hymnExists = fs.existsSync(hymnPath);

        if (!hymnExists) return resolve(this.vars.messages.notfound);
        // parse hymns
        const _hymn = require(hymnPath);
        const parsed = this.agent.parse(_hymn.orig);
        const _text = [
          `## ${parsed.title}`,
          parsed.feecting,
        ].join('\n')

        return resolve({
          text:feecting.a.text,
          html:feecting.a.html,
          data:_hymn.data,
        })
      });
    },
    learn(packet) {
      return new Promise((resolve, reject) => {
        const data = {};

        const { rules, cleaner, max_len } = this.vars.veda;

        if (!this.vars.veda.hymn1) {
          this.vars.veda.hymn1 = this.func.hymn();
          this.vars.veda.hymn2 = this.func.hymn();
          this.vars.veda.hymn3 = this.func.hymn();
        }
        else {
          this.vars.veda.hymn1 = this.vars.veda.hymn2;
          this.vars.veda.hymn2 = this.vars.veda.hymn3;
          this.vars.veda.hymn3 = this.func.hymn();
        }

        this.vars.veda.text = this.lib.copy(rules);

        this.prompt(`hymns: ${this.vars.veda.hymn1} ${this.vars.veda.hymn1} ${this.vars.veda.hymn1}`)

        this.prompt(`get hymn 1: ${this.vars.veda.hymn1}`)
        this.question(`#veda view ${this.vars.veda.hymn1}`).then(hymn1 => {
          temp = cleanText(hymn1.a.text.substring(0, max_len), cleaner)
          this.vars.veda.text.push('::begin:hymn1');
          this.vars.veda.text.push(temp);
          this.vars.veda.text.push('::end:hymn1');
          data.hymn1 = hymn1.a.data // set the data into an object for retrieval later.

          this.prompt(`get hymn 2: ${this.vars.veda.hymn2}`)
          return this.question(`#veda view ${this.vars.veda.hymn2}`)
        }).then(hymn2 => {
          temp = cleanText(hymn2.a.text.substring(0, max_len), cleaner)
          this.vars.veda.text.push('::begin:hymn2');
          this.vars.veda.text.push(temp);
          this.vars.veda.text.push('::end:hymn2');
          data.hymn2 = hymn2.a.data // set the data into an object for retrieval later.

          this.prompt(`get hymn 3: ${this.vars.veda.hymn3}`)
          return this.question(`#veda view ${this.vars.veda.hymn3}`)
        }).then(hymn3 => {
          temp = cleanText(hymn3.a.text.substring(0, max_len), cleaner);
          this.vars.veda.text.push('::begin:hymn1');
          this.vars.veda.text.push(temp);
          this.vars.veda.text.push('::end:hymn2');

          this.prompt(`get watson analysis`)
          return this.question(`#watson language ${this.vars.veda.text.join('\n')}`)
        }).then(watson => {
          this.vars.veda.text.push('::begin:analysis');
          this.vars.veda.text.push(watson.a.text);
          this.vars.veda.text.push('::end:analysis');
          data.watson = watson.a.data // set the data into an object for retrieval later.

          packet.q.text = this.vars.veda.text.join('\n');

          this.prompt(`send to gpt`)
          packet.q.meta.params[1] = 'indra';
          packet.q.meta.params[2] = 'deva';

          return this.func.chat(packet.q);
        }).then(gpt => {
          data.gpt = gpt.data;
          return resolve({
            text: `\n${gpt.text}`,
            html: gpt.html,
            data,
          });
        }).catch(reject)
      });
    },

  },
  methods: {
    /**************
    method: books
    params: packet
    describe: Call the books function to get a listing of books.
    ***************/
    books(packet) {
      return this.func.books(packet);
    },

    /**************
    method: book
    params: packet
    describe: call the book function to get the contents of a book
    ***************/
    book(packet) {
      return this.func.book(packet);
    },

    /**************
    method: hymn
    params: packet
    describe: Call the view function to read a specific book
    ***************/
    hymn(packet) {
      return this.func.hymn(packet.q.text);
    },

    /**************
    method: uid
    params: packet
    describe: Call core unique id generator.
    ***************/
    uid(packet) {
      return Promise.resolve(this.uid());
    },

    /**************
    method: status
    params: packet
    describe: Return the current status for the Veda Deva.
    ***************/
    status(packet) {
      return this.status();
    },

    /**************
    method: help
    params: packet
    describe: View the help for the Veda Deva.
    ***************/
    help(packet) {
      return new Promise((resolve, reject) => {
        this.lib.help(packet.q.text, __dirname).then(help => {
          return this.question(`#feecting parse ${help}`);
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: parsed.a.data,
          });
        }).catch(reject);
      });
    }
  },
});
module.exports = VEDA
