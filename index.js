// Copyright (c)2021 Quinn Michaels
// The Rig Veda Deva
import Deva from '@indra.ai/deva';
import pkg from './package.json' with {type:'json'};
import utils from './utils.js';

import data from './data/index.js';
const {agent,vars,rigveda} = data;

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
  listeners: {},
  modules: {},
  deva: {},
  func: {
    /**************
    func: books
    params: packet
    describe: Return a listiig of the Rig Veda Books.
    ***************/
    books() {
      return new Promise((resolve, reject) => {
        try {
          const agent = this.agent();
          const {id, title, describe, DATA} = rigveda.index;
          const _text = [
            `::begin:${agent.key}:${id}`,
            `## ${title}`,
            `p: ${describe}`,
            '::begin:menu',
          ];
          const _books = [];
          // loop over the data and format it into a feecting command string
          DATA.forEach((book, idx) => {
            _books.push(`button[${book.title}]:#${agent.key} book ${book.key}`);
          });
          const _booksText = _books.join('\n');
          const _booksHash = this.lib.hash(_booksText);
          _text.push(_booksText);
          _text.push(`::end:menu`);
          _text.push(`::end:${agent.key}:${_booksHash}`);
          _text.push(`::begin:hidden`);
          _text.push(`#color = ::agent_color::`);
          _text.push(`#bgcolor = ::agent_bgcolor::`);
          _text.push(`#bg = ::agent_background::`);
          _text.push(`::end:hidden`);
          return this.finish({
            id,
            text: _text.join('\n'),
            html: false,
            data: {
              title,
              describe,
              books: DATA,
              hash: this.lib.hash(JSON.stringify(DATA)),
            },
            created: Date.now(),
          }, resolve);
        } catch (e) {
          return reject(e);
        }
      });
    },
    /***********
    func: book
    params: packet
    describe: The book function calls the public facing api to get a listing of books to list to the user. originally this file came from sacred-texts.com but was migrated to indra.church with a json api.
    ***********/
    book(text) {
      return new Promise((resolve, reject) => {
        if (!text) return resolve(this.vars.messages.nobook);
        try {
          const agent = this.agent();
          const key = text.length < 2 ? `0${text}` : text;
          const theFile = this.lib.fs.readFileSync(`./data/rigveda/${key}.json`);
          const theJSON = JSON.parse(theFile);

          const {id, title, describe, DATA} = theJSON;

          const _text = [
            `::begin:${agent.key}:${id}`,
            `## ${title}`,
            `p: ${describe}`,
            '::begin:menu',
          ];
          const _hymns = [];
          DATA.forEach((hymn, idx) => {
            _hymns.push(`button[${hymn.key} - ${hymn.title}]:#${agent.key} hymn ${hymn.key}`);
          });
          const _hymnsText = _hymns.join('\n');
          const _hymnsHash = this.lib.hash(_hymnsText);
          _text.push(_hymnsText);
          _text.push(`::end:menu`);
          _text.push(`::end:${agent.key}:${_hymnsHash}`);
          _text.push(`::begin:hidden`);
          _text.push(`#color = ::agent_color::`);
          _text.push(`#bgcolor = ::agent_bgcolor::`);
          _text.push(`#bg = ::agent_background::`);
          _text.push(`::end:hidden`);

          return this.finish({
            id,
            text: _text.join('\n'),
            html: false,
            data: {
              title,
              describe,
              hymns: DATA,
              hash: this.lib.hash(JSON.stringify(DATA)),
            },
            created: Date.now(),
          }, resolve);
        } catch (e) {
          return reject(e);
        }
      });
    },

    /**************
    func: hymn
    params: packet
    describe: The View function returns a specific hymn from one of the Books.
    ***************/
    hymn(h) {
      return new Promise((resolve, reject) => {
        if (!h) return resolve(this._messages.notext);
        const id = this.lib.uid();
        const agent = this.agent();

        try {
          const hymnPath = this.lib.path.join(__dirname, 'data', 'rigveda', 'hymns', `${h}.json`);
          const hymnExists = this.lib.fs.existsSync(hymnPath);
          if (!hymnExists) return resolve(this.vars.messages.notfound);
          // parse hymns
          const theFile = this.lib.fs.readFileSync(hymnPath);
          const _hymn = JSON.parse(theFile);
          const processed = this.utils.process({key:_hymn.key,title:_hymn.title,content:_hymn.orig});

          const hymn = [
            `::BEGIN:HYMN:${processed.key}`,
            `# ${processed.title}`,
            '::begin:content',
            processed.text,
            '::end:content',
            '::begin:meta',
            `key: ${processed.key}`,
            `title: ${processed.title}`,
            processed.people.length ? `people: ${processed.people.join(', ')}` : '',
            processed.places.length ? `places: ${processed.places.join(', ')}` : '',
            processed.things.length ? `things: ${processed.things.join(', ')}` : '',
            processed.groups.length ? `groups: ${processed.groups.join(', ')}` : '',
            processed.concepts.length ? `concepts: ${processed.concepts.join(', ')}` : '',
            '::end:meta',
            `::begin:hidden`,
            `#color = ::agent_color::`,
            `#bgcolor = ::agent_bgcolor::`,
            `#bg = ::agent_background::`,
            `::end:hidden`,
            `::END:HYMN:${this.lib.hash(processed)}`,
          ];

          return resolve({
            id,
            key: processed.key,
            book: processed.book,
            text: hymn.join('\n'),
            html:false,
            data: processed,
            created: Date.now(),
          });
        } catch (e) {
          return reject(e);
        }
      });
    },
    learnSetup(book=0) {
      this.vars.learn.books = rigveda.books.map(bk => bk.key);
      this.vars.learn.book = book;
      this.vars.learn.hymns = rigveda.books[this.vars.learn.book].map(itm => itm.key);
      this.vars.learn.hymn1 = this.vars.learn.hymns.shift();
      this.vars.learn.hymn2 = this.vars.learn.hymns.shift();
      this.vars.learn.hymn3 = this.vars.learn.hymns.shift();
      return true;
    },
    learnHymns() {
      const { learn } = this.vars;
      this.vars.learn.training = []; // set the training array for the current learn.
      if (!learn.hymns.length) {
        const nextBookIndex = learn.book + 1 === rigveda.books.length ? 0 : learn.book + 1;
        this.func.learnSetup(nextBookIndex);
      }
      else {
        this.vars.learn.hymn1 = this.vars.learn.hymn2;
        this.vars.learn.hymn2 = this.vars.learn.hymn3;
        this.vars.learn.hymn3 = this.vars.learn.hymns.shift();
      }
      return true;
    },

    learn() {
      return new Promise((resolve, reject) => {
        this.prompt(`hymns: ${this.vars.learn.hymn1} ${this.vars.learn.hymn1} ${this.vars.learn.hymn1}`)
        this.prompt(`get hymn 1: ${this.vars.learn.hymn1}`)
        this.func.hymn(this.vars.learn.hymn1).then(hymn1 => {
          this.vars.learn.training.push(hymn1.data);
          this.prompt(`get hymn 2: ${this.vars.learn.hymn2}`)
          return this.func.hymn(this.vars.learn.hymn2)
        }).then(hymn2 => {
          this.vars.learn.training.push(hymn2.data);
          this.prompt(`get hymn 3: ${this.vars.learn.hymn3}`)
          return this.func.hymn(this.vars.learn.hymn3)
        }).then(hymn3 => {
          this.vars.learn.training.push(hymn3.data);
          const text = [];

          this.vars.learn.training.forEach((item, index) => {
            if (!item) return;
            const hymn = [
              `::begin:hymn:${item.key}`,
              this.trimWords(item.text, 150),
              `::end:hymn:${this.lib.hash(item.text)}`,
            ]
            const info = [
              `people: ${item.people.join(', ')}`,
              `places: ${item.places.join(', ')}`,
              `things: ${item.things.join(', ')}`,
              `groups: ${item.groups.join(', ')}`,
              `concepts: ${item.concepts.join(', ')}`,
            ]
            info.unshift(`::begin:info:${item.key}`);
            info.push(`::end:info:${this.lib.hash(info.join('\n'))}`);
            text.push(hymn.join('\n'));
            text.push(info.join('\n'));
          });
          return resolve({
            text: text.join('\n'),
            html: false,
            data: this.vars.learn,
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
      this.context('books');
      return new Promise((resolve, reject) => {
        if (!packet) return reject(this._messages.nopacket);
        let data;
        this.func.books().then(books => {
          data = books;
          return this.question(`#feecting parse:${this.agent.key} ${books.text}`)
        }).then(feecting => {
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

    /**************
    method: book
    params: packet
    describe: call the book function to get the contents of a book
    ***************/
    book(packet) {
      return new Promise((resolve, reject) => {
        if (!packet) return reject(this._messages.nopacket);
        this.context('book', packet.q.text);
        const agent = this.agent();
        let data;
        this.func.book(packet.q.text).then(book => {
          data = book;
          return this.question(`#feecting parse:${agent.key} ${book.text}`);
        }).then(feecting => {
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
    method: hymn
    params: packet
    describe: Call the hymn function to read a specific book
    ***************/
    hymn(packet) {
      return new Promise((resolve, reject) => {
        if (!packet) return reject(this._messages.nopacket);
        this.context('hymn', packet.q.text);
        const agent = this.agent();
        let data;
        this.func.hymn(packet.q.text).then(hymn => {
          data = hymn.data
          const {text} = hymn;

          this.talk(`chat:location`, {
            id: this.lib.uid(),
            data: `We are studying ${hymn.title} of the Rig Veda`,
            created: Date.now()
          });

          this.talk(`chat:topic`, {
            id: this.lib.uid(),
            data: `Current topic is Rig Veda hymn ${text}`,
            created: Date.now(),
          });

          return this.question(`${this.askChr}feecting parse:${agent.key} ${text}`);
        }).then(feecting => {
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
    method: view
    params: packet
    describe: view helper that calls hym to allow view interactions.
    ***************/
    view(packet) {
      this.context('view');
      return this.methods.hymn(packet);
    },

    /**************
    method: learn
    params: packet
    describe: Call the learn function to read a specific book
    ***************/
    learn(packet) {
      this.context('learn');
      let data, text;
      return new Promise((resolve, reject) => {
        this.func.learn().then(learn => {
          data = learn.data;
          text = learn.text;
          packet.q.text = learn.text;
          return this.func.chat(packet);
        }).then(chat => {
          console.log('CHAT RETURN', chat);
          return this.question(`#feecting parse ${text}`);
        }).then(feecting => {
          this.func.learnHymns();
          return resolve({
            text: feecting.a.text,
            html: feecting.a.html,
            data,
          })
        }).catch(err => {
          return this.error(err, packet, reject);
        })
      });
    },

    async json(packet) {
      this.context('json');
      // here we want to build text files for all the books that we can use in a custom agent.
      // first we need to get all the books
      try {
        this.action('get', 'get books');
        const books = await this.func.books();
        books.data.books.forEach(async book => {
          this.action('get', `Get book ${book.key}`);
          const hymns = await this.func.book(book.key);
          const jsonbook = {
            id: this.lib.uid(true),
            key: book.key,
            describe: book.describe,
            link: `https://indra.ai/rigveda/books/${book.key}.html`,
            hymns: [],
            copyright: '©2023 Quinn Michaels (indra.ai). All rights reserved.',
            created: this.formatDate(Date.now(), 'long', true),
          };

          const loopTo = hymns.data.hymns.length;
          for (var i = 0; i < loopTo; i++) {
            const {data} = await this.func.hymn(hymns.data.hymns[i].key);
            const hymn = {
              id: this.lib.uid(true),
              key: data.key,
              book: data.book,
              title: data.title,
              link: `https://indra.ai/rigveda/hymns/${data.key}.html`,
              text:data.text,
              people: data.people,
              places: data.places,
              things: data.things,
              groups: data.groups,
              concepts: data.concepts,
              hash: data.hash,
              created: this.formatDate(Date.now(), 'long', true),
            };
            jsonbook.hymns.push(hymn);
          }

          const jsonfile = this.lib.path.join(__dirname, 'data', 'json', `rigveda-book-${book.key}.json`);
          this.prompt(`writing json ${jsonfile}`)
          this.state('data', `Writing json ${jsonfile}`);
          this.lib.fs.writeFileSync(jsonfile, JSON.stringify(jsonbook));
        });
      }
      catch (e) {
        return this.error(packet, e, Promise.reject());
      }
      finally {
        return await Promise.resolve({
          text: 'building json files',
          html: '<p>building json files</p>',
          data: false
        })
      }
    }
  },
  onReady(data, resolve) {
    this.func.learnSetup();
    this.prompt(this.vars.messages.ready);
    return resolve(data);
  },
  onError(err, data, reject) {
    this.prompt(this.vars.messages.error);
    console.log(err);
    return reject(err);
  },
});
export default VEDA
