// Copyright (c)2021 Quinn Michaels. All Rights Reserved
const fs = require('fs'); // include for file system manipulation.
const path = require('path'); // include for path joining
const he = require('he'); // used for html entity encoding and decoding.

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
    const cleanRegEx = new RegExp(x, 'gm');
    text = text.replace(cleanRegEx, cleaner[x]);
  }
  return text;
}

module.exports = (input) => {

  const decoded = he.decode(input)

  const titleStr = /<h3.+>(.+)<\/h3>/g;
  const textStr = /<p>(\d+)?\s?(.+)?<\/p>/g;
  const nextStr = /<a href="rv(.+)\.htm">Next<\/a>/i;
  const prevStr = /<a href="rv(.+)\.htm">Previous<\/a>/i;
  const bookStr = /<a href="rvi(.+)\.htm">(.+)<\/a>/i;
  const keyStr = /<a href="\.\.\/rvsan\/rv(.+)\.htm">Sanskrit<\/a>/i;

  const previous = prevStr.test(decoded) ? prevStr.exec(decoded)[1].trim() : false; // previous page
  const next = nextStr.test(decoded) ? nextStr.exec(decoded)[1].trim() : false; // next page
  const book = bookStr.test(decoded) ? bookStr.exec(decoded)[1].trim() : false; // book index
  const key = keyStr.test(decoded) ? keyStr.exec(decoded)[1].trim() : false;
  const original = `https://sacred-texts.com/hin/rigveda/rv${key}.htm`;
  const sanskrit = `https://sacred-texts.com/hin/rvsan/rv${key}.htm`;

  const textExec = textStr.exec(decoded);

  let title = cleanText(titleStr.exec(decoded)[1].trim());
  let text = 'p:' + textExec[2].replace(/<br>\s(\d+)(\s)?(\.)?/g, '\n\np:').replace(/<br>(\s)?/g, '$1');
  text = cleanText(text)

  const describeStr =/^p:(.+?[.|?|;|!])/;
  const describe = describeStr.exec(text) ? describeStr.exec(text)[1].trim() : false;

  // next here we need to check for people places and things then add them to a meta index.
  // this will start with that we loop over he processing value key peple
  const ret = {
    key,
    title,
    book,
    describe,
    text,
    links: {
      original,
      sanskrit,
    },
    people: [],
    places: [],
    things: [],
    groups: [],
    concepts: [],
  }

  getProcessingData('people').forEach(person => {
    const _reg = new RegExp(`(\\b)(${person})(\\b)`, 'g');
    const hasPerson = _reg.exec(ret.text);
    if (hasPerson) {
      const _replace = new RegExp(`(\\b)${hasPerson[2]}(\\b)`, 'g');
      const _person = `@${hasPerson[2].replace(/\s/g, '_')}`;
      if (!ret.things.includes(_person)) ret.people.push(_person);
      ret.text = ret.text.replace(_replace, `$1${_person}$2`);
    }
  });

  getProcessingData('places').forEach(place => {
    const _reg = new RegExp(`(\\b)(${place})(\\b)`, 'g');
    const hasPlace = _reg.exec(ret.text);
    if (hasPlace) {
      const _replace = new RegExp(`(\\b)${hasPlace[2]}(\\b)`, 'g');
      const _place = `$${hasPlace[2].replace(/\s/g, '_')}`;
      if (!ret.things.includes(_place)) ret.places.push(_place);
      ret.text = ret.text.replace(_replace, `$1${_place}$2`);
    }
  });

  getProcessingData('things').forEach(thing => {
    const _reg = new RegExp(`(\\b)(${thing})(\\b)`, 'g');
    const hasThing = _reg.exec(ret.text);
    if (hasThing) {
      const _replace = new RegExp(`(\\b)${hasThing[2]}(\\b)`, 'g');
      const _thing = `#${hasThing[2].replace(/\s/g, '_')}`;
      if (!ret.things.includes(_thing)) ret.things.push(_thing);
      ret.text = ret.text.replace(_replace, `$1${_thing}$2`);
    }
  });

  getProcessingData('groups').forEach(group => {
    const _reg = new RegExp(`(\\b)(${group})(\\b)`, 'gi');
    const hasGroup = _reg.exec(ret.text);
    if (hasGroup) {
      const _replace = new RegExp(`(\\b)${hasGroup[2]}(\\b)`, 'g');
      const _group = `!${hasGroup[2].replace(/\s/g, '_')}`;
      if (!ret.things.includes(_group)) ret.groups.push(_group);
      ret.text = ret.text.replace(_replace, `$1${_group}$2`);
    }
  });

  getProcessingData('concepts').forEach(concept => {
    const _reg = new RegExp(`(\\b)(${concept})(\\b)`, 'gi');
    const hasConcept = _reg.exec(ret.text);
    if (hasConcept) {
      if (!ret.things.includes(concept)) ret.concepts.push(concept);
    }
  });
  ret.text = ret.text.replace(/##/g, '#');
  return ret;
}
