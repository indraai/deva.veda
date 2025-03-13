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

export default {
  index: index.DATA,
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
