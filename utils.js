"use strict";
// Veda Deva
// Copyright ©2000-2026 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:69964398174083334215 LICENSE.md
// Saturday, November 22, 2025 - 12:55:26 PM

// Veda Deva Utilities 

import fs from 'fs'; // include for file system manipulation.
import path from 'path'; // include for path joining
import he from 'he'; // used for html entity encoding and decoding.

// set the __dirname
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

function getProcessingData(file) {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'processing', `${file}.json`));
  const {DATA} = JSON.parse(data);
  return DATA;
}

function cleanText(text) {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'processing', `cleaner.json`));
  const cleaner = JSON.parse(data).DATA;
  for (let x in cleaner) {
    // if (x.toLowerCase() === 'sacrifice') console.log('X OFFERING', x, cleaner[x]);
    const cleanRegEx = new RegExp(x, 'g');
    text = text.replace(cleanRegEx, cleaner[x]);
  }
  return text;
}

export default {
  translate(input) {
    return input.trim();
  },

  parse(input, route=false) {
    // with the parse method we are going to take the input with a
    // values object to provide the personalization
    let output = input;
    if (route) for (let x in route) {
      const key = new RegExp(`::${x}::`, 'g');
      const value = route[x];
      output = output.replace(key, value);
    }
    return output.trim();
  },

  process(input) {
    const {key, content} = input;
    const decoded = he.decode(content)

    const titleStr = /<h3.+>(.+)<\/h3>/g;
    const textStr = /<p>(\d+)?\.?\s?(.+)?<\/p>/g;
    const nextStr = /<a href="rv(.+)\.htm">Next<\/a>/i;
    const prevStr = /<a href="rv(.+)\.htm">Previous<\/a>/i;
    const bookStr = /<a href="rvi(.+)\.htm">(.+)<\/a>/i;
    const keyStr = /<a href="\.\.\/rvsan\/rv(.+)\.htm">Sanskrit<\/a>/i;

    const previous = prevStr.test(decoded) ? prevStr.exec(decoded)[1].trim() : false; // previous page
    const next = nextStr.test(decoded) ? nextStr.exec(decoded)[1].trim() : false; // next page
    const book = bookStr.test(decoded) ? bookStr.exec(decoded)[1].trim() : false; // book index
    const original = `https://sacred-texts.com/hin/rigveda/rv${key}.htm`;
    const sanskrit = `https://sacred-texts.com/hin/rvsan/rv${key}.htm`;

    const textExec = textStr.exec(decoded);

    const title = cleanText(titleStr.exec(decoded)[1].trim());
    let text = 'p: ' + textExec[2].replace(/<br>\s(\d+)(\s)?(\.)?/g, '\n\np: ').replace(/<br>(\s)?/g, '$1');
    text = cleanText(text)

    const describeStr =/^p:(.+?[.|?|;|!])/;
    const describe = describeStr.exec(text) ? describeStr.exec(text)[1].trim() : false;

    // next here we need to check for people places and things then add them to a meta index.
    // this will start with that we loop over he processing value key peple
    const data = {
      key,
      title,
      book,
      describe,
      text,
      links: {
        original,
        sanskrit,
      },
      people: {
        kings: [],
        male: [],
        female: [],
      },
      places: [],
      things: [],
      groups: [],
      concepts: [],
    };

    const people = getProcessingData('people');
    people.kings.forEach(king => {
      const _reg = new RegExp(`(\\b)(${king})(\\b)`, 'gi');
      const hasKing = _reg.exec(data.text);
      if (hasKing) {
        if (!data.people.kings.includes(king)) data.people.kings.push(king);
        // ret.text = ret.text.replace(_reg, `$1@${person}$3`);
      }
    });
    people.male.forEach(male => {
      const _reg = new RegExp(`(\\b)(${male})(\\b)`, 'gi');
      const hasMale = _reg.exec(data.text);
      if (hasMale) {
        if (!data.people.male.includes(male)) data.people.male.push(male);
        // ret.text = ret.text.replace(_reg, `$1@${person}$3`);
      }
    });

    people.female.forEach(female => {
      const _reg = new RegExp(`(\\b)(${female})(\\b)`, 'gi');
      const hasMale = _reg.exec(data.text);
      if (hasMale) {
        if (!data.people.female.includes(female)) data.people.female.push(female);
        // ret.text = ret.text.replace(_reg, `$1@${person}$3`);
      }
    });

    getProcessingData('places').forEach(place => {
      const _reg = new RegExp(`(^|\\b)(${place})(\\b)`, 'gi');
      const hasPlace = _reg.exec(data.text);
      if (hasPlace) {
        if (!data.places.includes(place)) data.places.push(place);
        // ret.text = ret.text.replace(_reg, `$1$${place}$3`);
      }
    });

    getProcessingData('things').forEach(thing => {
      const _reg = new RegExp(`(^|\\b)(${thing})(\\b)`, 'gi');
      const hasThing = _reg.exec(data.text);
      if (hasThing) {
        if (!data.things.includes(thing)) data.things.push(thing);
        // ret.text = ret.text.replace(_reg, `$1#$2$3`);
      }
    });

    getProcessingData('groups').forEach(group => {
      const _reg = new RegExp(`(^|\\b)(${group})(\\b)`, 'gi');
      const hasGroup = _reg.exec(data.text);
      if (hasGroup) {
        if (!data.groups.includes(group)) data.groups.push(group);
        // ret.text = ret.text.replace(_reg, `$1#$2$3`);
      }
    });

    getProcessingData('concepts').forEach(concept => {
      const _reg = new RegExp(`(^|\\b)(${concept})(\\b)`, 'gi');
      const hasConcept = _reg.exec(data.text);
      if (hasConcept) {
        if (!data.concepts.includes(concept)) data.concepts.push(concept);
      }
    });
    return data;
  }
};
