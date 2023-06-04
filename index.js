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
  dir: __dirname,
  url: package.homepage,
  git: package.repository.url,
  bugs: package.bugs.url,
  author: package.author,
  license: package.license,
  copyright: package.copyright,
};

const {agent,vars,rigveda} = require('./data');

const Deva = require('@indra.ai/deva');
const VEDA = new Deva({
  info,
  agent,
  vars,
  utils: {
    translate(input) {
      return input.trim();
    },
    parse(input, route=false) {
      // with the parse method we are going to take the input with a
      // values object to provide the personalization
      let output = input;
      if (route) for (let x in route) {
        const key = new RegExp(`::${x}::`, 'g');
        const value = route[x];
        output = output.replace(key, value);
      }
      return output.trim();
    },
    process: require('./_process'),
  },
  listeners: {},
  modules: {},
  deva: {},
  func: {
    ved_question(packet) {
      const agent = this.agent();
    },
    ved_answer(packet) {
      const agent = this.agent();
    },
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
            `::begin:books:${id}`,
            `title: ${title}`,
            `describe: ${describe}`,
            '::begin:menu',
          ];
          const _books = [];
          // loop over the data and format it into a feecting command string
          DATA.forEach((book, idx) => {
            _books.push(`button[${book.key} - ${book.title}]:#${agent.key} book ${book.key}`);
          });
          const _booksText = _books.join('\n');
          const _booksHash = this.hash(_booksText);
          _text.push(_booksText);
          _text.push(`::end:menu`);
          _text.push(`::end:books:${_booksHash}`);
          return resolve({
            id,
            text: _text.join('\n'),
            html: false,
            data: {
              title,
              describe,
              books: DATA,
              hash: this.hash(JSON.stringify(DATA)),
            },
            created: Date.now(),
          })
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
          const book = rigveda.books.find(v => v.key === key);

          if (!book) return resolve(this.vars.messages.nobook);

          const {id, title, describe, DATA} = book;
          const _text = [
            `::begin:hymns:${id}`,
            `title: ${title}`,
            `describe: ${describe}`,
            '::begin:menu',
          ];

          const _hymns = [];
          DATA.forEach((hymn, idx) => {
            _hymns.push(`button[${hymn.key} - ${hymn.title}]:#${agent.key} hymn ${hymn.key}`);
          });
          const _hymnsText = _hymns.join('\n');
          const _hymnsHash = this.hash(_hymnsText);
          _text.push(_hymnsText);
          _text.push(`::end:menu`);
          _text.push(`::end:hymns:${_hymnsHash}`);
          return resolve({
            id,
            text: _text.join('\n'),
            html: false,
            data: {
              title,
              describe,
              hymns: DATA,
              hash: this.hash(JSON.stringify(DATA)),
            },
            created: Date.now(),
          });
        } catch (e) {
          return reject(e);
        }
      });
    },

    /**************
    func: view
    params: packet
    describe: The View function returns a specific hymn from one of the Books.
    ***************/
    hymn(h) {
      return new Promise((resolve, reject) => {
        if (!h) return resolve(this._messages.notext);
        const id = this.uid();

        try {
          const hymnPath = path.join(__dirname, 'data', 'rigveda', 'hymns', `${h}.json`);
          const hymnExists = fs.existsSync(hymnPath);
          if (!hymnExists) return resolve(this.vars.messages.notfound);
          // parse hymns
          const theFile = fs.readFileSync(hymnPath);
          const _hymn = JSON.parse(theFile);
          const processed = this.utils.process(_hymn.orig);

          const hymn = [
            `## ${processed.title}`,
            `::begin:hymn:${processed.key}`,
            processed.text,
            `::end::hymn:${this.hash(processed.text)}`,
            '',
          ];
          if (processed.people.length) {
            hymn.push(`people: ${processed.people.join(', ')}`);
          }
          if (processed.places.length) {
            hymn.push(`places: ${processed.places.join(', ')}`);
          }
          if (processed.things.length) {
            hymn.push(`things: ${processed.things.join(', ')}`);
          }
          if (processed.groups.length) {
            hymn.push(`groups: ${processed.groups.join(', ')}`);
          }
          if (processed.concepts.length) {
            hymn.push(`concepts: ${processed.concepts.join(', ')}`);
          }

          return resolve({
            id: this.uid(),
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
      this.vars.learn.hymns = rigveda.books[this.vars.learn.book].DATA.map(itm => itm.key);
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
              `::end:hymn:${this.hash(item.text)}`,
            ]
            const info = [
              `people: ${item.people.join(', ')}`,
              `places: ${item.places.join(', ')}`,
              `things: ${item.things.join(', ')}`,
              `groups: ${item.groups.join(', ')}`,
              `concepts: ${item.concepts.join(', ')}`,
            ]
            info.unshift(`::begin:info:${item.key}`);
            info.push(`::end:info:${this.hash(info.join('\n'))}`);
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
      this.context('book');
      return new Promise((resolve, reject) => {
        if (!packet) return reject(this._messages.nopacket);
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
      this.context('hymn');
      return new Promise((resolve, reject) => {
        if (!packet) return reject(this._messages.nopacket);
        const agent = this.agent();
        let data;
        this.func.hymn(packet.q.text).then(hymn => {
          data = hymn;
          return this.question(`#feecting parse:${agent.key} ${hymn.text}`);
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

    /**************
    method: issue
    params: packet
    describe: create a new issue for the main deva.world through github agent.
    ***************/
    issue(packet) {
      const agent = this.agent();
      return new Promise((resolve, reject) => {
        this.question(`#github issue:${agent.key} ${packet.q.text}`).then(issue => {
          return resolve({
            text: issue.a.text,
            html: issue.a.html,
            data: issue.a.data,
          })
        }).catch(err => {
          return this.error(err, packet, reject);
        });
      });
    },

    /**************
    method: uid
    params: packet
    describe: Call core unique id generator.
    ***************/
    uid(packet) {
      this.context('uid');
      return Promise.resolve(this.uid());
    },

    /**************
    method: status
    params: packet
    describe: Return the current status for the Veda Deva.
    ***************/
    status(packet) {
      this.context('status');
      return this.status();
    },

    /**************
    method: help
    params: packet
    describe: View the help for the Veda Deva.
    ***************/
    help(packet) {
      this.context('help');
      return new Promise((resolve, reject) => {
        this.help(packet.q.text, __dirname).then(help => {
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
  onDone(data) {
    this.func.learnSetup();
    return Promise.resolve(data);
  },
});
module.exports = VEDA
