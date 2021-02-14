/*-------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2021 Mike Erickson / Codedungeon.  All rights reserved.
 * Licensed under the MIT license.  See LICENSE in the project root for license information.
 * -----------------------------------------------------------------------------------------*/

const { expect } = require('chai')
const { exec } = require('child_process')
const pkgInfo = require('../package.json')

describe('info', (done) => {
  it('should return correct command name', (done) => {
    let info = require('../src/commands/info')
    expect(info.name).equal('info')
    done()
  })

  it('should use default command', (done) => {
    exec('laravel-versions-cli', (err, stdout, stderr) => {
      let result = stdout.replace(/\n/gi, '')
      expect(result).contain('Laravel Version Information')
    })
    done()
  })

  it('should show version when command help supplied', (done) => {
    exec('laravel-versions-cli --help', (err, stdout, stderr) => {
      let result = stdout.replace(/\n/gi, '')
      expect(result).contain('v' + pkgInfo.version)
    })
    done()
  })

  it('should execute info command help', (done) => {
    exec('laravel-versions-cli info --help', (err, stdout, stderr) => {
      let result = stdout.replace(/\n/gi, '')
      expect(result).contain('info')
      // expect(result).contain('default command')
      expect(result).contain('Options:')
      expect(result).contain('--versions, -s')
      expect(result).contain('laravel-versions-cli info --versions 8')
    })
    done()
  })

  it('should execute info command with only version 8', (done) => {
    exec('laravel-versions-cli info --versions 8', (err, stdout, stderr) => {
      let result = stdout.replace(/\n/gi, '')
      expect(result).contain('8.')
    })
    done()
  })

  it('should execute info command with only 6 and 8', (done) => {
    exec('laravel-versions-cli info --versions 6,8', (err, stdout, stderr) => {
      let result = stdout.replace(/\n/gi, '')
      expect(result).contain('8.')
      expect(result).to.not.contain('7.30')
      expect(result).contain('6.')
    })
    done()
  })

  it('should execute info command suppressing future versions', (done) => {
    exec('laravel-versions-cli info --show-future false', (err, stdout, stderr) => {
      let result = stdout.replace(/\n/gi, '')
      expect(result).to.not.contain('(estimated)')
    })
    done()
  })

  it('should execute sample command help', (done) => {
    exec('laravel-versions-cli info', (err, stdout, stderr) => {
      let result = stdout.replace(/\n/gi, '')
      expect(result).contain('8.')
      expect(result).contain('7.')
      expect(result).contain('6.')
      expect(result).contain('5.')
    })
    done()
  })
})
