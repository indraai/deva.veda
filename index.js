// Copyright (c)2021 Quinn Michaels
const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Deva = require('@indra.ai/deva');
const VEDAS = new Deva({
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
    /**************
    func: books
    params: packet
    describe: Return a listiig of the Rig Veda Books.
    ***************/
    books(packet) {
      return new Promise((resolve, reject) => {
        if (!packet) return reject('NO PACKET');
        const {title, describe, data} = require(__dirname, path.join('json', 'index.json'));
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
        }).catch(reject);
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
        });
      });
    },

    /**************
    func: view
    params: packet
    describe: The View function returns a specific hymn from one of the Books.
    ***************/
    view(h) {
      return new Promise((resolve, reject) => {
        if (!h) return reject('NO HYMN');
        const hymnPath = path.join(__dirname, 'json', 'hymns', `${h}.json`);
        const hymnExists = fs.existsSync(hymnPath);

        if (!hymnExists) return resolve(this.vars.messages.notfound);

        const _hymn = require(hymnPath);
        const parsed = this.agent.parse(this.lib.decode(_hymn.orig));
        const _text = [
          `## ${parsed.title}`,
          parsed.feecting,
          `::begin:commands`,
          `cmd[next]:#${this.agent.key} view ${parsed.meta.next}`,
          `cmd[previous]:#${this.agent.key} view ${parsed.meta.previous}`,
          `cmd[book]:#${this.agent.key} book ${parsed.meta.book}`,
          `::end:commands`,
          `::begin:links`,
          `link[Original]:${parsed.meta.original}`,
          `link[Sanskrit]:${parsed.meta.sanskrit}`,
          `::end:links`,
        ].join('\n')
        this.question(`#feecting parse:${this.agent.key} ${_text}`).then(feecting => {
          return resolve({
            text:feecting.a.text,
            html:feecting.a.html,
            data:_hymn.data,
          })
        }).catch(reject);
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
    method: view
    params: packet
    describe: Call the view function to read a specific book
    ***************/
    view(packet) {
      return this.func.view(packet.q.text);
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
module.exports = VEDAS
