// set the __dirname
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function rvbooks(packet) {
  // first thing is to get the books list
  this.prompt('get books');

  const vedaindex = {
    id: this.lib.uid(),
    title: 'Rig Veda Books',
    describe: 'The Rig Veda is one of the most ancient texts known to man. Inside are stories, lessons, and knowledge to be found.',
    orig: 'https://www.sacred-texts.com/hin/rigveda/index.htm',
    api: 'data/rigveda/index.json',
    data: [],
    created: Date.now(),
  };
  
  const bookspath = this.lib.path.join(__dirname, 'index.json');
  const booksindex = this.lib.fs.readFileSync(bookspath);
  const booksdata = JSON.parse(booksindex);
  for (let book of booksdata.data) {
    this.prompt(`📙 Book: ${book.key} ${book.title}`);
    const bookpath = this.lib.path.join(__dirname, `${book.key}.json`);
    const bookindex = this.lib.fs.readFileSync(bookpath);
    const bookdata = JSON.parse(bookindex);
    for (let hymn of bookdata.DATA) {
      this.prompt(`📗 Hymn: ${hymn.title}`);
      const hymnpath = this.lib.path.join(__dirname, 'hymns', `${hymn.key}.json`);
      const hymnindex = this.lib.fs.readFileSync(hymnpath);
      const hymndata = JSON.parse(hymnindex);

      // write the original data to html files for backups.
      // const htmlpath = this.lib.path.join(__dirname, '..', 'html', 'rigveda', book.key, `${hymn.key}.htm`);
      // this.lib.fs.writeFileSync(htmlpath, hymndata.orig, {encoding:'utf8',flag:'w'});
    }
  }
}

export async function rvbooksold(packet) {
  this.context('json');
  // here we want to build text files for all the books that we can use in a custom agent.
  // first we need to get all the books
  try {
    this.action('get', 'get books');
    const books = await this.func.books();
    books.data.books.forEach(async book => {
      this.action('get', `Get book ${book.key}`);
      const hymns = await this.func.book(book.key);
      const jsonbook = {
        id: this.lib.uid(),
        key: book.key,
        describe: book.describe,
        link: `https://indra.ai/rigveda/books/${book.key}.html`,
        hymns: [],
        copyright: '©2025 Quinn Michaels (indra.ai). All rights reserved.',
        created: this.formatDate(Date.now(), 'long', true),
      };

      const loopTo = hymns.data.hymns.length;
      for (var i = 0; i < loopTo; i++) {
        const {data} = await this.func.hymn(hymns.data.hymns[i].key);
        const hymn = {
          id: this.lib.uid(),
          key: data.key,
          book: data.book,
          title: data.title,
          link: `https://indra.ai/rigveda/hymns/${data.key}.html`,
          text:data.text,
          people: data.people,
          places: data.places,
          things: data.things,
          groups: data.groups,
          concepts: data.concepts,
          hash: data.hash,
          created: this.formatDate(Date.now(), 'long', true),
        };
        jsonbook.hymns.push(hymn);
      }
      const jsonfile = this.lib.path.join(__dirname, 'data', 'json', `rigveda-book-${book.key}.json`);
      this.prompt(`writing json ${jsonfile}`);
      this.state('data', `Writing json ${jsonfile}`);
      this.lib.fs.writeFileSync(jsonfile, JSON.stringify(jsonbook));
    });
  }
  catch (e) {
    return this.error(packet, e, Promise.reject());
  }
  finally {
    return await Promise.resolve({
      text: 'building json files',
      html: '<p>building json files</p>',
      data: false
    })
  }
}
