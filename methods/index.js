"use strict";
// ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:49633069290486712918 LICENSE.md

import {manu, manuhash} from '../data/manu/index.js';
import {rvbooks} from '../data/rigveda/index.js';
import {avbooks} from '../data/atharvaveda/index.js';
import {svbooks} from '../data/samaveda/index.js';

import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

export const methods = {
	/**************
	method: menu
	params: packet
	describe: Call the menu function to get a listing of knowledge.
	***************/
	menu(packet) {
		this.context('menu');
		this.action('method', 'menu');
		return new Promise((resolve, reject) => {
			if (!packet) return reject(this._messages.nopacket);
			const data = {};
			this.func.menu().then(menu => {
				data.menu = menu;
				return this.question(`${this.askChr}feecting parse ${menu.text}`);
			}).then(feecting => {
				data.feecting = feecting;
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
	method: books
	params: packet
	describe: Call the books function to get a listing of books.
	***************/
	books(packet) {
		this.context('books');
		this.action('method', 'books');
		return new Promise((resolve, reject) => {
			if (!packet) return reject(this._messages.nopacket);
			const data = {};
			this.func.books(packet.q).then(books => {
				data.books = books;
				return this.question(`${this.askChr}feecting parse ${books.text}`);
			}).then(feecting => {
				data.feecting = feecting;
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
		this.context('book', packet.q.text);
		return new Promise((resolve, reject) => {
			if (!packet) return reject(this._messages.nopacket);
			const agent = this.agent();
			const data = {};
			this.func.book(packet.q).then(book => {
				data.book = book;
				return this.question(`${this.askChr}feecting parse ${book.text}`);
			}).then(feecting => {
				data.feecting = feecting;
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
	
	laws(packet) {
		this.context('laws', packet.id);
		this.action('method', `laws:${packet.id}`);
		const data = {};
		return new Promise((resolve, reject) => {
			this.func.laws(packet).then(laws => {
				data.laws = laws.data;
				return this.question(`${this.askChr}feecting parse ${laws.text}`);
			}).then(parsed => {
				data.feecting = parsed.a.data;
				this.state('return', `laws:${packet.id}`);
				return resolve({
					text: parsed.a.text,
					html: parsed.a.html,
					data,
				});
			}).catch(err => {
				return this.error(err, packet. reject);
			});
		});
	},
	
	cleanup(packet) {
		// clean up the data books index for the knowledge base. 
		this.prompt('clean up data index');
		return new Promise((resolve, reject) => {
			try {
				const agent = this.agent();
				const indexfile = this.lib.path.join(__dirname, '..', 'data', packet.q.text, 'index.json');
				
				this.prompt(`read ${indexfile}`);
				const indexdata = this.lib.fs.readFileSync(indexfile);
				const indexjson = JSON.parse(indexdata);
				const data = [];
				indexjson.data.forEach((item,index) => {
					const newitem = {
						id: this.lib.uid(),
						key: item.key,
						title: item.title,
						api: `data/${packet.q.text}/books/${item.key}.json`,
						orig: item.orig || false,
						created: Date.now(),
					}
					newitem.hash = this.lib.hash(newitem);
					data.push(newitem);
				});
				indexjson.data = data;
				indexjson.created = Date.now();
				indexjson.hash = this.lib.hash(indexjson);
				this.prompt(`write ${indexfile}`);
				this.lib.fs.writeFileSync(indexfile, JSON.stringify(indexjson, null, 2), {encoding:'utf8',flag:'w'});
				return resolve({
					text: 'cleanup',
					html: 'cleanup',
					data: indexjson,
				})
			} catch (err) {
				return this.error(err, packet, reject)			
			}
		});
	},
	rvbooks,
	avbooks,
	svbooks,
};