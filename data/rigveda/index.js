// set the __dirname
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

import index from './index.json' with {type:'json'};
import book01 from './01.json' with {type:'json'};
import book02 from './02.json' with {type:'json'};
import book03 from './03.json' with {type:'json'};
import book04 from './04.json' with {type:'json'};
import book05 from './05.json' with {type:'json'};
import book06 from './06.json' with {type:'json'};
import book07 from './07.json' with {type:'json'};
import book08 from './08.json' with {type:'json'};
import book09 from './09.json' with {type:'json'};
import book10 from './10.json' with {type:'json'};

export const data = {
  index: index,
  books: [
    book01.DATA,
    book02.DATA,
    book03.DATA,
    book04.DATA,
    book05.DATA,
    book06.DATA,
    book07.DATA,
    book08.DATA,
    book09.DATA,
    book10.DATA,
  ]
}

export async function bookimport(packet) {
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
