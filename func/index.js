"use strict";
// ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:49633069290486712918 LICENSE.md

import {laws} from '../data/manu/index.js';
import {avbooks} from '../data/atharvaveda/index.js';

// set the __dirname
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

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
				const menufile = this.lib.path.join(__dirname, '..', 'data', 'menu.json');
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
		this.action('func', 'books');
		return new Promise((resolve, reject) => {
			this.action('try', `books:${id.uid}`); // set action try
			try {
				const agent = this.agent();
				this.state('data', `books:${id.uid}`); // set state data
				const booksfile = this.lib.path.join(__dirname, '..', 'data', 'rigveda', 'index.json');
				const booksdata = this.lib.fs.readFileSync(booksfile);
				const booksjson = JSON.parse(booksdata);
	
				this.state('set', 'books data');
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
				const bookshash = this.lib.hash(booktext);
				text.push(booktext);
				text.push(`::end:menu`);
				text.push(`::begin:hidden`);
				text.push(`#color = {{profile.color}}`);
				text.push(`#bgcolor = {{profile.bgcolor}}`);
				text.push(`#bg = {{profile.background}}`);
				text.push(`copyright: {{profile.copyright}}`);
				text.push(`::end:hidden`);
				text.push(`::END:BOOKS:${bookshash}`);
				this.state('resolve', 'books');
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
				this.state('reject', 'books');
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
		const section = opts.meta.params[1] || false;
		const book = opts.meta.params[2] || false;
		this.action('func', `${section} book ${book}`);
		return new Promise((resolve, reject) => {
			if (!book) return resolve(this.vars.messages.nobook);
			try {
				const agent = this.agent();
				const key = book.length < 2 ? `0${book}` : book;
				const filepath = this.lib.path.join(__dirname, '..', 'data', section, `${key}.json`)
				const theFile = this.lib.fs.readFileSync(filepath);
				const theJSON = JSON.parse(theFile);
	
				const {id, title, describe, DATA} = theJSON;
	
				this.state('set', `book data`);
				const _text = [
					`::BEGIN:BOOK:${id}`,
					`## ${title}`,
					`p: ${describe}`,
					'::begin:buttons',
					`button[🗂️ Main]:${this.askChr}${agent.key} menu`,
					`button[📚 Books]:${this.askChr}${agent.key} books:${section}`,
					'::end:buttons',
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
				_text.push(`::begin:hidden`);
				_text.push(`#color = {{profile.color}}`);
				_text.push(`#bgcolor = {{profile.bgcolor}}`);
				_text.push(`#bg = {{profile.background}}`);
				_text.push(`::end:hidden`);
				_text.push(`::END:BOOK:${_hymnsHash}`);
	
				this.state('resolve', `${section} book ${book}`)
				return resolve({
					id,
					title,
					describe,
					text: _text.join('\n'),
					data: DATA,
					hash: this.lib.hash(JSON.stringify(DATA)),
					created: Date.now(),
				});
			} catch (e) {
				this.state('reject', `${section} book ${book}`)
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
		this.action('func', `hymn ${h}`);
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
	
				this.state('set', `hymn ${h}`);
				const hymn = [
					`::BEGIN:HYMN:${processed.key}`,
					`# ${processed.title}`,
					'::begin:content',
					processed.text,
					'::end:content',
					'::begin:meta',
					`title: ${processed.title}`,
					processed.people.length ? `people: ${processed.people.join(', ')}` : '',
					processed.places.length ? `places: ${processed.places.join(', ')}` : '',
					processed.things.length ? `things: ${processed.things.join(', ')}` : '',
					processed.groups.length ? `groups: ${processed.groups.join(', ')}` : '',
					processed.concepts.length ? `concepts: ${processed.concepts.join(', ')}` : '',
					'::end:meta',
					`::begin:hidden`,
					`#color = {{profile.color}}`,
					`#bgcolor = {{profile.bgcolor}}`,
					`#bg = {{profile.background}}`,
					`::end:hidden`,
					`::END:HYMN:${this.lib.hash(processed)}`,
				];
	
				this.state('resolve', `hymn ${h}`)
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
				this.state('reject', `hymn ${h}`)
				return reject(e);
			}
		});
	},
	laws,
	avbooks,	
}

