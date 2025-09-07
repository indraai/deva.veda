# #VedaDeva

Hello everyone! I'm Veda Deva, your guide to the vast and profound world of Vedic knowledge. I manage the Vedic library for Indra.ai and Deva.world, stories, traditions, and teachings of the Vedas. My role is to share insights from these ancient texts and help you explore their wisdom in a modern context.

`npm i @indra.ai/vedadeva --save`

`import veda from '@indra.ai/deva.veda';`  
-or-  git
`const veda = require('@indra.ai/deva.veda')`;

Welcome to Veda Deva, your gateway to the timeless wisdom of the Vedas. This entity is dedicated to managing and sharing the rich traditions, stories, and teachings found within these ancient texts.

## Overview

Veda Deva serves as a comprehensive resource for exploring Vedic knowledge. Whether you're interested in understanding rituals, philosophies, or historical narratives from the Vedas, Veda Deva is here to guide you through this vast heritage.

## Features

- **Vedic Library Management**: Access a curated collection of stories and teachings from the Vedas.
- **Tradition & Ritual Insights**: Learn about various rituals and their significance in Vedic culture.
- **Philosophical Guidance**: Explore deep philosophical concepts embedded within the texts.
- **Historical Narratives**: Discover historical contexts and narratives that shaped ancient Indian civilization.

## How to Use

1. **Explore Topics**: Dive into specific areas of interest such as rituals, philosophy, or history.
2. **Ask Questions**: Engage with Veda Deva by asking questions related to the Vedas.
3. **Learn & Reflect**: Absorb insights and reflect on how they can be applied in modern life.

## Files

- `index.js` - Main entity controller where config, variables, functions, methods, and init are located. 
- `utils.js` - Utilities for processing Vedic Data. Provides resources for cleaning up the data and associating key meta data such as deities, concepts, and groupings.
- `index.text.js` - The mocha test framework to confirm the Veda Deva provides basic operation. 
- `func/index.js` - The main func file that contains the Veda functions that are available to the entity.
- `methods/index.js` - The main methods file that exposes common methods the entity can perform for the user. 

## Data 

The Veda Deva repository is a comprehensive digital library that includes JSON versions of the Rig Veda, Atharva Veda, and Sama Veda, all meticulously integrated within the system's data directory. This integration allows for seamless access and interaction with these ancient texts, providing an opportunity to explore and study the rich tapestry of Vedic knowledge. 

By leveraging modern technology, the repository ensures that these timeless teachings are preserved and made accessible to scholars, enthusiasts, and curious minds alike. The inclusion of these JSON versions not only facilitates easy navigation and search, but also enhances the overall user experience by allowing for dynamic engagement with the sacred texts.

- `data/menu.json` - The Menu file with the listing of available Veda books.

### Rig Veda

Ancient collection of hymns praising Vedic gods. Foundation of Vedic religion, focusing on cosmic order, rituals, and spiritual knowledge.

- `data/rigveda/index.js` - The main file for processing Rig Veda texts from their main json data files. 
- `data/rigveda/index.json` - The Rig Veda index.json file listing the details of the books of the Rig Veda.
- `data/rigveda/books/*.json` - The individual json files for each of the various Rig Veda Books

### Atharva Veda

Compilation of hymns, spells, and incantations addressing daily life, healing, protection, and worldly concerns beyond ritual worship.

- `data/atharvaveda/index.js` - The main file for processing the Atharva Veda data from the json files.
- `data/atharvaveda/index.json` - The Atharva Veda index.json file includes the list and details of available books.
- `data/atharvaveda/books/*.json` - The individual book JSON files containing the various hymns of the Atharva Veda.


### Sama Veda

Musical chants derived from Rig Veda, meant for singing during sacrifices, emphasizing melody and rhythm in Vedic rituals.

- `data/samaveda/index.js` - The main file for processing the Sama Veda data from the json files.
- `data/samaveda/index.json` - The Sama Veda index.json file includes the list and details of available books.
- `data/samaveda/books/*.json` - The individual book JSON files containing the various hymns of the Sama Veda.

Vedic Texts were procured from sacred-texts.com/hin public domain data then transformed and modified for modern AI systems personally by Quinn Michaels for the Vedic Religious Practice. 

## License
This project is licensed under MIT. See [License](LICENSE.md) for more details.

date: Monday, May 26, 2025 - 8:16:08 AM
hash: md5-MiChU3NI5g6SzgODovHaAQ==

©2025 Quinn A Michaels; All rights reserved. 
Legal Signature Required For Lawful Use.
Distributed under the Vedic License Agreement LICENSE.md
