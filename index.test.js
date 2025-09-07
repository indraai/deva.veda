// ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under the Vedic License Agreement LICENSE.md
// Vedas Deva test file

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
