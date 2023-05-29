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

const {agent,vars,rigveda} = require('./data');

const Deva = require('@indra.ai/deva');
const VEDA = new Deva({
  info,
  agent: {
    uid: agent.id,
    key: agent.key,
    name: agent.name,
    describe: agent.describe,
    prompt: agent.prompt,
    voice: agent.voice,
    profile: agent.profile,
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
  vars,
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
    async template(packet, route) {
      const agent = this.agent();
      const header = await this.question(this.vars.template.header.call);
      const footer = await this.question(this.vars.template.footer.call);
      const greeting = await this.question(this.vars.template.content.greeting);
      const signature = await this.question(this.vars.template.content.signature);
      const laws = await this.question(this.vars.template.laws.call);
      const template = await this.question(this.vars.template.template.call);
      const message = [
        greeting.a.text,
        '',
        packet.q.text,
        '',
        signature.a.text,
      ].join('\n');
      const header_parsed = this._agent.parse(header.a.text, route);
      const header_hash = this.hash(header_parsed);
      const footer_parsed = this._agent.parse(footer.a.text, route);
      const footer_hash = this.hash(footer_parsed);
      const laws_parsed = this._agent.parse(laws.a.text, route);
      const laws_hash = this.hash(laws_parsed);
      const template_parsed = this._agent.parse(template.a.text, route);
      const template_hash = this.hash(template_parsed);
      const message_parsed = this._agent.parse(message, route);
      const message_hash = this.hash(message_parsed);
      const text = [
        `${this.vars.template.header.begin}:${header.id}`,
        header_parsed,
        `${this.vars.template.header.end}:${header_hash}`,
        '',
        `${this.vars.template.laws.begin}:${laws.id}`,
        laws_parsed,
        `${this.vars.template.laws.end}:${laws_hash}`,
        '',
        `${this.vars.template.content.begin}:${packet.id}`,
        '',
        message_parsed,
        '',
        `${this.vars.template.content.end}:${message_hash}`,
        '',
        `${this.vars.template.template.begin}:${template.id}`,
        template_parsed,
        `${this.vars.template.template.end}:${template_hash}`,
        '',
        `${this.vars.template.footer.begin}:${footer.id}`,
        footer_parsed,
        `${this.vars.template.footer.end}:${this.hash(footer_hash)}`,
      ].join('\n');
      return text;
    },
    async chat(packet) {
      const param = packet.q.meta.params[1] || false;
      const local_route = param || this.vars.route;
      const route = this.config.routes[local_route];
      const question = await this.func.template(packet, route);
      let question_puppet = false;
      if (route.puppet_key) question_puppet = await this.func.template(packet, this.config.routes[route.puppet_key]);
      return new Promise((resolve, reject) => {
        if (!packet.q.text) return resolve(this._messages.notext);
        if (!param && route.puppet_key) this.question(`${route.puppet} ${question_puppet}`)
        this.question(`${route.call} ${question}`).then(answer => {
          return resolve({
            text: answer.a.text,
            html: answer.a.html,
            data: answer.a.data,
          });
        }).catch(reject);
      });
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
            '',
          ];
          const _books = [];
          // loop over the data and format it into a feecting command string
          DATA.forEach((book, idx) => {
            _books.push(`book: ${book.key}`);
            _books.push(`title: ${book.title}`);
            _books.push(`cmd: #${agent.key} book ${book.key}`);
            if (idx < DATA.length - 1) _books.push(``);
          });
          const _booksText = _books.join('\n');
          const _booksHash = this.hash(_booksText);
          _text.push(_booksText);
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
        if (!text) return reject(this.vars.messages.nobook);
        try {
          const agent = this.agent();
          const book = text.length < 2 ? `0${text}` : text;
          const {id, title, describe, DATA} = rigveda.books[book];

          const _text = [
            `::begin:hymns:${id}`,
            `title: ${title}`,
            `describe: ${describe}`,
            '',
          ];

          const _hymns = [];

          DATA.forEach((hymn, idx) => {
            _hymns.push(`hymn: ${hymn.key}`)
            _hymns.push(`title: ${hymn.title}`)
            _hymns.push(`cmd: #${agent.key} view ${hymn.key}`)
            if (idx < DATA.length - 1) _hymns.push('')
          });
          const _hymnsText = _hymns.join('\n');
          const _hymnsHash = this.hash(_hymnsText);
          _text.push(_hymnsText);
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
          const processed = this._agent.process(_hymn.orig);

          const hymn = [
            `::begin:hymn:${processed.key}`,
            processed.text,
            `::end:hymn:${this.hash(processed.text)}`,
          ];
          const info = [];
          if (processed.people.length) {
            info.push(`people: ${processed.people.join(', ')}`);
          }
          if (processed.places.length) {
            info.push(`places: ${processed.places.join(', ')}`);
          }
          if (processed.things.length) {
            info.push(`things: ${processed.things.join(', ')}`);
          }
          if (processed.groups.length) {
            info.push(`groups: ${processed.groups.join(', ')}`);
          }
          if (processed.concepts.length) {
            info.push(`concepts: ${processed.concepts.join(', ')}`);
          }

          info.unshift(`::begin:info:${processed.key}`),
          info.push(`::end:info:${this.hash(info.join('\n'))}`);

          return resolve({
            id: this.uid(),
            text: hymn.concat(info).join('\n'),
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
    func: chat
    params: packet
    describe: The chat relay interface to talk with the @api and @ui
    ***************/
    chat(packet) {
      return new Promise((resolve, reject) => {
        this.func.chat(packet).then(answer => {
          return this.question(`#feecting parse ${answer.a.text}`);
        }).then(feecting => {

        }).catch(err => {
          return this.error(err, packet, reject)
        })
      });
    },

    send(packet) {
      const agent = this.agent();
      let data;
      return new Promise((resolve, reject) => {
        // first we get the hymn from the text
        this.func.hymn(packet.q.text).then(hymn => {
          data = hymn;
          packet.q.text = hymn.text;
          return this.func.chat(packet);
        }).then(chat => {
          return resolve(chat);
        }).catch(err => {
          return this.error(err, packet, reject);
        })
      });
    },

    /**************
    method: books
    params: packet
    describe: Call the books function to get a listing of books.
    ***************/
    books(packet) {
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
    method: view
    params: packet
    describe: Call the view function to read a specific book
    ***************/
    view(packet) {
      return new Promise((resolve, reject) => {
        let data;
        this.func.hymn(packet.q.text).then(hymn => {
          data = hymn;
          return this.question(`#feecting parse ${hymn.text}`);
        }).then(feecting => {
          return resolve({
            text: feecting.a.text,
            html: feecting.a.html,
            data,
          })
        }).catch(err => {
          return this.error(err, packet, reject);
        })
      });
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
  onDone(data) {
    this.func.learnSetup();
    this.listen('devacore:question', packet => {
      if (packet.q.text.includes(this.vars.trigger)) return this.func.ved_question(packet);
    });
    this.listen('devacore:answer', packet => {
      if (packet.a.text.includes(this.vars.trigger)) return this.func.ved_answer(packet);
    });

    return Promise.resolve(data);
  },
});
module.exports = VEDA
