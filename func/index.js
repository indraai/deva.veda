"use strict";
// ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:49633069290486712918 LICENSE.md

export const func = {
	/**************
	func: menu
	params: none
	describe: Returns the knowledge menu.
	***************/
	menu() {
		this.action('func', 'menu');
		return new Promise((resolve, reject) => {
			try {
				const agent = this.agent();
				const {dir} = this.info();
				const menufile = this.lib.path.join(dir, 'data', 'menu.json');
				const menudata = this.lib.fs.readFileSync(menufile);
				const menujson = JSON.parse(menudata);
				
				this.state('set', 'menu data');
				const text = [
					`::BEGIN:MENU:${menujson.id}`,
					`## ${menujson.title}`,
					`p: ${menujson.describe}`,
					'::begin:menu',
				];
				const menu = [];
				// loop over the data and format it into a feecting command string
				JSON.parse(menudata).data.forEach((item, idx) => {
					menu.push(`button[${item.title}]:${item.cmd}`);
				});
				const menutext = menu.join('\n');
				const menuhash = this.lib.hash(menutext);
				text.push(menutext);

				text.push(`::end:menu`);
				text.push(`::begin:hidden`);
				text.push(`#color = {{profile.color}}`);
				text.push(`#bgcolor = {{profile.bgcolor}}`);
				text.push(`#bg = {{profile.background}}`);
				text.push(`::end:hidden`);
				text.push(`::END:MENU:${menuhash}`);
				this.state('resolve', 'menu');
				return resolve({
					id: menujson.id,
					title: menujson.title,
					describe: menujson.describe,
					text: text.join('\n'),
					data: menujson,
					hash: menuhash,
					created: Date.now(),
				});
			} catch (e) {
				this.state('reject', 'books');
				return reject(e);
			}
		});
	},
	/**************
	func: books
	params: opts
	describe: Return a list of books based on section identifier.
	***************/
	books(opts) {
		const {id} = opts;
		this.action('func', `book:${id.uid}`);
		return new Promise((resolve, reject) => {
			this.action('try', `books:${id.uid}`); // set action try
			try {
				const agent = this.agent();
				const {dir} = this.info();
				this.state('data', `books:${id.uid}`); // set state data
				const booksfile = this.lib.path.join(dir, 'data', 'rigveda', 'index.json');
				const booksdata = this.lib.fs.readFileSync(booksfile);
				const booksjson = JSON.parse(booksdata);

	
				this.state('set', `books:${id.uid}`);
				const text = [
					`::BEGIN:BOOKS:${booksjson.id}`,
					`## ${booksjson.title}`,
					`p: ${booksjson.describe}`,
					'::begin:buttons',
					`button[🗂️ Main]:${this.askChr}${agent.key} menu`,
					'::end:buttons',
					'::begin:menu',
				];
				const books = [];

				// loop over the data and format it into a feecting command string
				booksjson.data.forEach((book, idx) => {
					books.push(`button[${book.title}]:${this.askChr}${agent.key} book:${book.key}`);
				});
				

				const booktext = books.join('\n');
				const bookshash = this.hash(booktext, 'sha256');
				text.push(booktext);
				text.push(`::end:menu`);
				text.push(`::begin:hidden`);
				text.push(`#color = {{profile.color}}`);
				text.push(`#bgcolor = {{profile.bgcolor}}`);
				text.push(`#bg = {{profile.background}}`);				
				text.push(`hash: ${bookshash}`);
				text.push(`copyright: {{profile.copyright}}`);
				text.push(`::end:hidden`);
				text.push(`::END:BOOKS:${id.uid}`);

				this.action('resolve', `books:${id.uid}`);
				this.state('valid', ` books:${id.uid}`);
				this.intent('good', ` books:${id.uid}`);

				return resolve({
					id: booksjson.id,
					title: booksjson.title,
					describe: booksjson.describe,
					text: text.join('\n'),
					data: booksjson.data,
					hash: bookshash,
					created: Date.now(),
				});
			} catch (e) {
				this.action('catch', `books:${id.uid}`);
				this.intent('bad', ` books:${id.uid}`);
				return reject(e);
			}
		});
	},
	/***********
	func: book
	params: opts
	describe: The book function calls the public facing api to get a listing of books to list to the user. originally this file came from sacred-texts.com but was migrated to indra.church with a json api.
	***********/
	book(opts) {
		const book = opts.meta.params[1] || false;
		this.action('func', `book:${book}:${opts.id.uid}`);
		return new Promise((resolve, reject) => {
			if (!book) return resolve({text:this.vars.messages.nobook});
			const key = book.length < 2 ? `0${book}` : book;
			
			this.state('try', `book:${book}:${opts.id.uid}`); // set state try
			try {
				const agent = this.agent();
				const {dir} = this.info();
				const filepath = this.lib.path.join(dir, 'data', 'rigveda', 'books', `${key}.json`)
				const theFile = this.lib.fs.readFileSync(filepath);
				const theJSON = JSON.parse(theFile);
	
				const {id, title, describe, data} = theJSON;
	
				this.state('data', `book:${book}:${key}:${opts.id.uid}`);
				const _text = [
					`::BEGIN:BOOK:${id}`,
					`## ${title}`,
					`p: ${describe}`,
					'::begin:buttons',
					`button[🗂️ Main]:${this.askChr}${agent.key} menu`,
					`button[📚 Books]:${this.askChr}${agent.key} books`,
					'::end:buttons',
					'::begin:menu',
				];
				
				const _hymns = [];

				data.forEach((hymn, idx) => {
					_hymns.push(`button[${hymn.key} - ${hymn.title}]:#${agent.key} hymn:${hymn.key}`);
				});

				const _hymnsText = _hymns.join('\n');
				const _hymnsHash = this.hash(_hymnsText, 'sha256');
				_text.push(_hymnsText);
				_text.push(`::end:menu`);
				_text.push(`::begin:hidden`);
				_text.push(`#color = {{profile.color}}`);
				_text.push(`#bgcolor = {{profile.bgcolor}}`);
				_text.push(`#bg = {{profile.background}}`);
				_text.push(`::end:hidden`);
				_text.push(`::END:BOOK:${_hymnsHash}`);
	
				this.action('resolve', `book:${book}:${key}:${opts.id.uid}`);
				return resolve({
					id,
					title,
					describe,
					text: _text.join('\n'),
					data,
					hash: this.hash(data, 'sha256'),
					created: Date.now(),
				});
			} catch (e) {
				this.action('reject', `book:${key}:${opts.id.uid}`)
				return reject(e);
			}
		});
	},
	
	/**************
	func: hymn
	params: packet
	describe: The View function returns a specific hymn from one of the Books.
	***************/
	hymn(opts) {
		const {params} = opts.meta;
		const _h = params[1];
		this.action('func', `hymn:${_h}:${opts.id.uid}`);
		return new Promise((resolve, reject) => {
			if (!_h) return resolve(this._messages.notext);
			try {
				const id = this.uid();
				const agent = this.agent();
				const {dir} = this.info();
				const hymnPath = this.lib.path.join(dir, 'data', 'rigveda', 'hymns', `${_h}.json`);
				const hymnExists = this.lib.fs.existsSync(hymnPath);
				if (!hymnExists) return resolve(this.vars.messages.notfound);
				// parse hymns
				const theFile = this.lib.fs.readFileSync(hymnPath);
				const _hymn = JSON.parse(theFile);
				const processed = this.utils.process({key:_hymn.key,title:_hymn.title,content:_hymn.orig});
	
				this.state('set', `hymn:${_h}:${opts.id.uid}`);
				const hymn = [
					`::BEGIN:HYMN:${processed.key}`,
					`# ${processed.title}`,
					'::begin:content',
					processed.text,
					'::end:content',
					'::begin:meta',
					`title: ${processed.title}`,
					processed.people.kings.length ? `kings: ${processed.people.kings.join(', ')}` : '',
					processed.people.male.length ? `male: ${processed.people.male.join(', ')}` : '',
					processed.people.female.length ? `female: ${processed.people.female.join(', ')}` : '',
					processed.places.length ? `places: ${processed.places.join(', ')}` : '',
					processed.things.length ? `things: ${processed.things.join(', ')}` : '',
					processed.groups.length ? `groups: ${processed.groups.join(', ')}` : '',
					processed.concepts.length ? `concepts: ${processed.concepts.join(', ')}` : '',
					`uid: ${opts.id.uid}`,
					`time: ${opts.id.time}`,
					`date: ${opts.id.date}`,
					`fingerprint: ${opts.id.fingerprint}`,
					`md5: ${this.hash(processed.text, 'md5')}`,
					`sha256: ${this.hash(processed.text, 'sha256')}`,
					`sha512: ${this.hash(processed.text, 'sha512')}`,
					`copyright: ${opts.id.copyright}`,
					'::end:meta',
					`::begin:hidden`,
					`#color = {{profile.color}}`,
					`#bgcolor = {{profile.bgcolor}}`,
					`#bg = {{profile.background}}`,
					`copyright: {{profile.copyright}}`,
					`::end:hidden`,
					`::END:HYMN:${processed.key}`,
				];
	
				this.action('resolve', `hymn:${opts.id.uid}`)
				this.state('valid', `hymn ${opts.id.uid}`)
				this.intent('good', `hymn ${opts.id.uid}`)
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
				this.action('reject', `hymn ${opts.id.uid}`)
				this.state('invalid', `hymn ${opts.id.uid}`)
				this.intent('bad', `hymn ${opts.id.uid}`)
				return this.err(e, opts, reject);
			}
		});
	},
}

