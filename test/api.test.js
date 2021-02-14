/*-------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2021 Mike Erickson / Codedungeon.  All rights reserved.
 * Licensed under the MIT license.  See LICENSE in the project root for license information.
 * -----------------------------------------------------------------------------------------*/

const { api } = require('@codedungeon/gunner')
const { expect } = require('chai')

describe('api module', (done) => {
  let apiTest
  beforeEach(() => {
    apiTest = api.create({
      baseURL: 'https://laravelversions.com/api/versions',
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
  })

  it('should access laravel versions api', async () => {
    let { data, status } = await apiTest.get()
    expect(status).to.equal(200)
    expect(data.data).to.be.an('array')
    expect(data.data.length).to.be.greaterThan(0)
  })

  it('should access laravel versions api first row', async () => {
    let { data, status } = await apiTest.get()
    expect(status).to.equal(200)
    let row = data.data[0]
    expect(row).to.be.an('object')
    expect(row).to.have.property('major')
    expect(row).to.have.property('latest_minor')
    expect(row).to.have.property('is_lts')
    expect(row).to.have.property('released_at')
    expect(row).to.have.property('status')
  })
})
