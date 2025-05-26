"use strict";
// set the __dirname
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

// (c)2025 Quinn Michaels; All rights reserved.
export function	manu(packet) {
	this.context('manu', packet.id);
	this.action('method', `manu:${packet.id}`);      
	return new Promise((resolve, reject) => {
		const data = {};
		const {personal} = this.legal();
		this.state('try', `Manu Laws:${packet.id}`);
		try {
			data.manu = personal.manu;
			data.files = [];
			for (let x = 0; x < data.manu.length; x++) {
				const file = data.manu[x];	
				const filePath = this.lib.path.join(__dirname, file);
				const html = this.lib.fs.readFileSync(filePath);
				const title = html.toString().split('<CENTER><H1>')[1].split('</H1></CENTER>')[0];
				const formatHTML = html.toString().split('</H1></CENTER>')[1].split('</BODY>')[0];
				const htmlData = formatHTML.replace(/\<\/P\>\n?\s?/gi, '').replace(/\'\d+\.\s?/g, '').split(/\<P\>\d+\.\s?/);
				const laws = htmlData.map(item => {
					const law = {
						id: this.lib.uid(),
						law: item,
						created: this.lib.formatDate(Date.now(), 'long', true),
					};
					law.hash = this.lib.hash(law);
					return law;
				});
				const result = {
					id: this.lib.uid(),
					title,
					data: laws,
					created: this.lib.formatDate(Date.now(), 'long', true),
				};
				result.hash = this.lib.hash(result);
				data.files.push(result);
				const key = x+1 < 10 ? `0${x+1}.json` : `${x+1}.json`;
				const jsonfile = this.lib.path.join(__dirname, 'data', 'laws', 'manu', key);
				this.lib.fs.writeFileSync(jsonfile, JSON.stringify(result, null, 2), {encoding:'utf8',flag:'w'});
			}          
		}
		catch(e) {
			this.state('catch', `manu:${packet.id}`);
			return this.error(e, packet, reject);
		}
		finally {
			this.state('retrun', `manu:${packet.id}`);
			return resolve({
				text: this.vars.messages.manu,
				html: this.vars.messages.manu,
				data
			});
		}
	});		
}

export async function manuhash(packet) {
	this.context('manu', packet.id);
	this.action('method', `manuhash:${packet.id}`);
	const filepath = this.lib.path.join(__dirname, 'manu', `${packet.q.text}.json`);
	const filedata = this.lib.fs.readFileSync(filepath);
	const filejson = JSON.parse(filedata);
	const newdata = {
		id: this.lib.uid(),
		title: filejson.title,
		created: this.lib.formatDate(Date.now(), 'long', true),
		hash: false,
		data: [],
	}
	for (let item of filejson.data) {
		const dbstr = item.dbid ? `${this.askChr}legal add:${item.dbid}` : `${this.askChr}legal add`;
		const dblaw = await this.question(`${dbstr} ${item.law}`);
		const newitem = {
			id: this.lib.uid(),
			dbid: dblaw.a.data,
			law: item.law,
			created: this.lib.formatDate(Date.now(), 'long', true),
		};
		newitem.hash = this.lib.hash(newitem);
		newdata.data.push(newitem);
	}
	newdata.hash = this.lib.hash(newdata);
	this.prompt(`filepath: ${filepath}`);
	this.lib.fs.writeFileSync(filepath, JSON.stringify(newdata, null, 2), {encoding:'utf8',flag:'w'});
	return Promise.resolve({
		text: 'rehash data',
		html: 'rehash data',
		data: false,
	});
} 

// laws func to get json data
export function laws(packet) {
	this.action('func', `laws:${packet.id}`);
	return new Promise((resolve, reject) => {
		if (!packet.q.text) return resolve(this._messages.notext);
		try {
			const {params} = packet.q.meta;
			const lookup = params[1] || 'manu';

			const filepath = this.lib.path.join(__dirname, lookup, `${packet.q.text}.json`);
			const filedata = this.lib.fs.readFileSync(filepath);
			const filejson = JSON.parse(filedata);
			const _laws = filejson.data.map(item => {
				return [
					`::begin:law:${item.id}`,
					`id: ${item.id}`,
					`law: ${item.law}`,
					`dbid: ${item.dbid}`,
					`hash: ${item.hash}`,
					`created: ${item.created}`,
					`::end:law:${item.hash}`,
				].join('\n');
			}).join('\n');
			const text = [
				`::BEGIN:LAWS:${filejson.id}`,
				`# ${filejson.title}`,
				_laws,
				`::begin:hidden`,
				`#color = {{profile.color}}`,
				`#bgcolor = {{profile.bgcolor}}`,
				`#bg = {{profile.background}}`,
				`::end:hidden`,
				`::END:LAWS:${filejson.hash}`,
			].join('\n');
			this.state('return', `laws:${packet.id}`);
			return resolve({
				text,
				data: filejson
			});
		}
		catch(e) {
			this.state('catch', `laws:${packet.id}`);
			return this.error(e, packet, reject);
		}
	});
}