"use strict";
// Copyright ©2000-2026 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:49633069290486712918 LICENSE.md
// Veda Deva Func

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
			
				const data = {
					id,
					key: processed.key,
					title: processed.title,
					text: processed.text,
					people: processed.people,
					places: processed.places,
					things: processed.things,
					groups: processed.groups,
					concepts: processed.concepts,
				}	
				data.md5 = this.hash(data.text, 'md5');
				data.sha256 = this.hash(data.text, 'sha256');
				data.sha512 = this.hash(data.text, 'sha512');
				this.state('set', `hymn:${_h}:${opts.id.uid}`);
				
				const hymn = [
					`${this.container.begin}:${agent.key.toUpperCase()}:HYMN:${data.key}`,
					`# ${data.title}`,
					`${this.box.begin}:${agent.key}:hymn:${data.key}:content:${data.id.uid}`,
					data.text,
					`${this.box.end}:${agent.key}:hymn:${data.key}:content:${data.id.uid}`,

					`${this.box.begin}:${agent.key}:hymn:${data.key}:meta:${data.id.uid}`,
					`title: ${data.title}`,
					data.people.kings.length ? `kings: ${data.people.kings.join(', ')}` : '',
					data.people.male.length ? `male: ${data.people.male.join(', ')}` : '',
					data.people.female.length ? `female: ${data.people.female.join(', ')}` : '',
					data.places.length ? `places: ${data.places.join(', ')}` : '',
					data.things.length ? `things: ${data.things.join(', ')}` : '',
					data.groups.length ? `groups: ${data.groups.join(', ')}` : '',
					data.concepts.length ? `concepts: ${data.concepts.join(', ')}` : '',
					`md5: ${data.md5}`,
					`sha256: ${data.sha256}`,
					`sha512: ${data.sha512}`,
					`${this.box.end}:${agent.key}:hymn:${data.key}:meta:${data.id.uid}`,
					
					`${this.box.begin}:${agent.key}:hymn:${data.key}:uid:${data.id.uid}`,
					`uid: ${data.id.uid}`,
					`time: ${data.id.time}`,
					`iso: ${data.id.iso}`,
					`utc: ${data.id.utc}`,
					`date: ${data.id.date}`,
					`warning: ${data.id.warning}`,
					`license: ${data.id.license}`,
					`fingerprint: ${data.id.fingerprint}`,
					`md5: ${data.id.md5}`,
					`sha256: ${data.id.sha256}`,
					`sha512: ${data.id.sha512}`,
					`copyright: ${data.id.copyright}`,
					`${this.box.begin}:${agent.key}:hymn:${data.key}:uid:${data.id.uid}`,

					`${this.box.begin}:hidden`,
					`#color = {{profile.color}}`,
					`#bgcolor = {{profile.bgcolor}}`,
					`#bg = {{profile.background}}`,
					`copyright: {{profile.copyright}}`,
					`${this.box.end}:hidden`,
					`${this.container.end}:${agent.key.toUpperCase()}:HYMN:${data.key}`,
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

