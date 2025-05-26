"use strict";

import he from 'he';
import * as cheerio from 'cheerio';

import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function svbooks(opts) {
	return new Promise((resolve, reject) => {
		let data;
		try {
			const indexpath = this.lib.path.join(__dirname, 'index.json');
			const indexdata = {
				id: this.lib.uid(),
				title: "The Samaveda Books",
				describe: "The Samaveda, or Veda of Holy Songs, third in the usual order of enumeration of the three Vedas, ranks next in sanctity and liturgical importance to the Rgveda or Veda of Recited praise.",
				api: 'data/samaveda/index.json',
				orig: 'https://sacred-texts.com/hin/sv.htm',
				data: [],
				created: Date.now(),
			}
			const htmlpath = this.lib.path.join(__dirname, '..', 'html', 'samaveda');
			const htmlindex = this.lib.path.join(htmlpath, 'index.htm');
			data = he.decode(this.lib.fs.readFileSync(htmlindex).toString());
			data = data.replace(/(\<h2|<h3|<h4|<p>)/gi, '\n$1');
			data = data.split('<H1 ALIGN="CENTER">HYMNS OF THE SAMAVEDA</H1>');
			const header = data[1];
			const parts = data[2].split('<H1 ALIGN="CENTER">');
			let bookkey = 1, hymnkey = 1;
			for (let x of parts) {
				const splitX = x.split('</H1>');
				const part = {
					title: splitX[0].trim(),
					content: splitX[1],
				};
				if (!part.title) continue;

				const books = part.content ? part.content.split('<H2 ALIGN="CENTER">') : [];
				if (!books.length) continue;

				this.prompt(`\nPart: ${part.title}`);				
				for (let y of books) {
					const splitY = y.split('</H2>');
					const book = {
						key: bookkey < 10 ? `0${bookkey}` : bookkey,
						title: splitY[0].trim(),
						content: splitY[1],
					};
					if (!book.title) continue;
					this.prompt(`Book: ${book.title}`);
					const bookdata = {
						id: this.lib.uid(),
						key: book.key,
						title: `${part.title} ${book.title}`, 
						api: `data/samaveda/books/${book.key}.json`,
						orig: 'https://sacred-texts.com/hin/sv.htm',
						created: Date.now(),
					};
					bookdata.hash = this.lib.hash(bookdata);
					indexdata.data.push(bookdata);
					bookkey = bookkey + 1;
					const currentbook = {
						id: bookdata.id,
						key: bookdata.key,
						title: bookdata.title,
						book: book.title,
						created: Date.now(),
						data: [] 
					}
// begin writing chapter data here. 
					const chapters = book.content ? book.content.split('<H3 ALIGN="CENTER">') : [];
					if (!chapters.length) continue;

					for (let z of chapters) {
						const splitZ = z.split('</H3>');
						const chapter = {
							title: splitZ[0].trim(),
							content: splitZ[1],
						};
						if (!chapter.title) continue;
						this.prompt(`Chapter - ${chapter.title}`);
						
						const hymns = chapter.content ? chapter.content.split('<H4 ALIGN="CENTER">') : [];
						if (!hymns.length) continue;
						
						for (let i of hymns) {
							const splitI = i.split('</H4>');
							const hymn = {
								title: splitI[0].trim(),
								content: splitI[1],
							};
							if (!hymn.title || !hymn.content) continue;
							hymn.content = hymn.content.replace(/<\/?p>|<\/body>|<\/html>/gi, '')
																				.replace(/<br>\n?\s+?\d+?\.\s+?/gi, '\np:')
																				.replace(/<br>\n?/gi, ' ')
																				.replace(/\n \n1.\s/g, 'p:')
																				.replace(/,\s\s/g, ', ')
																				.replace(/\n\s\n/g, '')
							this.prompt(`Hymn - ${hymn.title}`);
							const hymndata = {
								id: this.lib.uid(),
								key: hymnkey < 10 ? `0${hymnkey}` : hymnkey,
								part: part.title,
								book: book.title,
								chapter: chapter.title,
								title: hymn.title,
								content: hymn.content,
								file: 'data/html/samaveda/index.htm',
								created: Date.now(),
							}
							hymndata.hash = this.lib.hash(hymndata);
							currentbook.data.push(hymndata);
							hymnkey = hymnkey + 1;
						} // end of hymns loop
					} // end of chapters loop
					// write book file here
					currentbook.hash = this.lib.hash(currentbook);
					const bookpath = this.lib.path.join(__dirname, 'books', `${currentbook.key}.json`);
					this.lib.fs.writeFileSync(bookpath, JSON.stringify(currentbook, null, 2), {encoding:'utf8',flag:'w'});
				} // end of books loop
			} // end of parts loop
			// write index file here. 
			indexdata.hash = this.lib.hash(indexdata);
			const jsonpath = this.lib.path.join(__dirname, 'index.json');
			this.lib.fs.writeFileSync(jsonpath, JSON.stringify(indexdata, null, 2), {encoding:'utf8',flag:'w'});
		} 
		catch (err) {
			return this.error(err, opts, reject);
		}
		finally {
			return resolve({
				text: 'success',
				html: 'success',
				data,
			});
		}
	});
} 