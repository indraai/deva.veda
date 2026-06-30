"use strict";
// Vedas Deva test file
// Copyright ©2000-2026 Quinn America Michaels; All rights reserved.  
// Owner Signature Required For Lawful Use.  
// Distributed under VLA:53011442349944699898 LICENSE.md
// Monday, June 29, 2026 - 1:51:04 PM PST

const {expect} = require('chai')
const vedas = require('./index.js');

describe(vedas.me.name, () => {
  beforeEach(() => {
    return vedas.init()
  });
  it('Check the SVARGA Object', () => {
    expect(vedas).to.be.an('object');
    expect(vedas).to.have.property('me');
    expect(vedas).to.have.property('vars');
    expect(vedas).to.have.property('listeners');
    expect(vedas).to.have.property('methods');
    expect(vedas).to.have.property('modules');
  });
})
