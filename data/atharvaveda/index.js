"use strict";
// set the __dirname
import he from 'he';
import * as cheerio from 'cheerio';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

export const data = {
	
}

// function to import the atharvaveda books from the html files.
export async function avbooks(packet) {
	this.context('import', `avbooks:${packet.id}`);      
	this.action('method', `avbooks:${packet.id}`);      
	try {
		// const baseurl = "https://sacred-texts.com/hin/av/"

		const indexpath = this.lib.path.join(__dirname, 'index.json');
		const indexdata = {
			id: this.lib.uid(),
			title: "The Atharvaveda Books",
			describe: " The Atharvaveda is one of the four Vedas, a collection of ancient texts that includes hymns, spells, and incantations for healing and rituals. It focuses on practical aspects of daily life, such as health, longevity, and protection from evil forces.",
			data: [],
			created: Date.now(),
		}
		for (let x = 1; x <= 20; x++) {
			const key = x < 10 ? `0${x}` : `${x}`;
			const htmlpath = this.lib.path.join(__dirname, 'html', key);
			const jsonpath = this.lib.path.join(__dirname, 'json', `${key}.json`);
			const htmlindex = this.lib.path.join(htmlpath, 'index.htm');
			const htmldata = he.decode(this.lib.fs.readFileSync(htmlindex).toString());
			const dataitem = {
				id: this.lib.uid(),
				title: htmldata.split('<H1 ALIGN="CENTER">')[1].split('</H1>')[0],
				book: htmldata.split('<H1 ALIGN="CENTER">')[2].split('</A>')[0],
				author: htmldata.split('<H3 ALIGN="CENTER">tr. by ')[1].split('</H3>')[0],
				created: Date.now(),
				data: htmldata.match(/<A\sHREF=\"av.+.htm\">.+<\/A><BR>/g).map(item => {
					const hymn = {
						id: this.lib.uid(),
						hymn: item.split('.htm">')[1].split(':')[0].trim(),
						title: item.split(': ')[1].split('</A>')[0].trim(),
						file: item.split('<A HREF="')[1].split('">')[0].trim(),
						created: Date.now(),
					}
					hymn.hash = this.lib.hash(hymn);
					return hymn;
				}),
			} // end of data packet.
			const indexitem = {
				id: dataitem.id,
				key,
				title: dataitem.book,
				json: `json/${key}.json`,  
				created: Date.now(),
			}
			indexitem.hash = this.lib.hash(indexitem);
			indexdata.data.push(indexitem);

			// loop over the books and get the files from the site and save them to the directory
			for (let x = 0; x < dataitem.data.length; x++) {
				const item = dataitem.data[x];
				const hymnpath = this.lib.path.join(htmlpath, item.file);
				const book = this.lib.fs.readFileSync(hymnpath).toString();
				const $ = cheerio.load(book);
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
				
				dataitem.data[x].content = content;
				dataitem.data[x].created = Date.now();
				dataitem.data[x].hash = this.lib.hash(dataitem.data[x]);
			}
			dataitem.hash = this.lib.hash(dataitem);
			this.prompt(`write ${jsonpath}`);
			this.lib.fs.writeFileSync(jsonpath, JSON.stringify(dataitem, null, 2), {encoding:'utf8',flag:'w'});
		} // end of for x loop of books
		indexdata.hash = this.lib.hash(indexdata);
		this.prompt(`write ${indexpath}`);
		this.lib.fs.writeFileSync(indexpath, JSON.stringify(indexdata, null, 2), {encoding:'utf8',flag:'w'});

	}
	catch(err) {
		throw err
	}
	finally {
		this.state('return', `avbooks:${packet.id}`);
		return 'atharvaveda books';
	}
}