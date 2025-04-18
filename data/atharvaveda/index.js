"use strict";
// set the __dirname
import he from 'he';
import * as cheerio from 'cheerio';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function avbooks(packet) {
	this.context('import', `avbooks:${packet.id}`);      
	this.action('method', `avbooks:${packet.id}`);      
	if (!packet.q.text) return resolve(this._messages.notext);
	try {
		// const baseurl = "https://sacred-texts.com/hin/av/"
		const filepath = this.lib.path.join(__dirname, 'html', packet.q.text);
		const fileindex = this.lib.path.join(filepath, 'index.htm');
		const filedata = he.decode(this.lib.fs.readFileSync(fileindex).toString());

		const data = {
			id: this.lib.uid(),
			title: filedata.split('<H1 ALIGN="CENTER">')[1].split('</H1>')[0],
			book: filedata.split('<H1 ALIGN="CENTER">')[2].split('</A>')[0],
			author: filedata.split('<H3 ALIGN="CENTER">tr. by ')[1].split('</H3>')[0],
			created: Date.now(),
			books: filedata.match(/<A\sHREF=\"av.+.htm\">.+<\/A><BR>/g).map(item => {
				const book = {
					id: this.lib.uid(),
					hymn: item.split('.htm">')[1].split(':')[0].trim(),
					title: item.split(': ')[1].split('</A>')[0].trim(),
					file: item.split('<A HREF="')[1].split('">')[0].trim(),
					created: Date.now(),
				}
				book.hash = this.lib.hash(book);
				return book;
			}),
		}
		data.hash = this.lib.hash(data);
		// loop over the books and get the files from the site and save them to the directory
		for (let x = 0; x < data.books.length; x++) {
			const item = data.books[x];
			const hymnpath = this.lib.path.join(filepath, item.file);
			const book = this.lib.fs.readFileSync(hymnpath).toString();
			const $ = cheerio.load(book);
			this.prompt(item.file);

			const step1 = book.split('<P ALIGN="CENTER"><FONT SIZE="-1" COLOR="GREEN">')[1];
			const step2 = step1.split('<p><HR>')[0];

			const step3 = step2.replace(/<h1 align=\"center\">.+?<\/h1>/gi, '')
													.replace(/\s?<I>Hymns of the Atharva\s?.+<HR><\/p>/gi, '')
													.replace(/\s?<h3 align="center" align="center">.+<\/h3>/gi, '')
													.replace(/\s?<h4 align="center">(.+)<\/h4>/gi, '')
													.replace(/\s?<span class="margnote"><FONT COLOR="GREEN" SIZE="-1"><A NAME=".+?">\d+?<\/A><\/FONT><\/span>/gi, '\n\n')
													.replace(/\s?<a name=".+?"><font size="1" color="green">.+?<\/font><\/A>/gi, '')
													.replace(/&nbsp;|<br>|<p>|<\/p>/gi, '')
													.trim()
													// .replace(/<span class="margnote"><FONT COLOR="GREEN" SIZE="-1"><A NAME=".+">\d+\.?<\/A><\/FONT><\/span>/gi, '\n\n')
													// .replace(/<p>|<\/p>/gi, '').trim()
			const content = he.decode(step3);				
			this.prompt(content + '\n---\n');
			
			data.books[x].content = content;
			data.books[x].created = Date.now();
			data.books[x].hash = this.lib.hash(data.books[x]);
		}
		const jsonpath = this.lib.path.join(__dirname, 'json', `${packet.q.text}.json`);
		this.lib.fs.writeFileSync(jsonpath, JSON.stringify(data, null, 2), {encoding:'utf8',flag:'w'});
	}
	catch(e) {
		console.log(e);
	}
	finally {
		this.state('return', `avbooks:${packet.id}`);
		return 'atharvaveda books';
	}
}