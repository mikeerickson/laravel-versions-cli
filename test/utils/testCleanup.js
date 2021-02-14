/*-------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2021 Mike Erickson / Codedungeon.  All rights reserved.
 * Licensed under the MIT license.  See LICENSE in the project root for license information.
 * -----------------------------------------------------------------------------------------*/

const { join } = require('path')
const { exec } = require('child_process')

;(async () => {
  let tempFiles = join('./src', 'commands', '*.temp')
  exec(`rm -rf ${tempFiles}`)
})().catch((err) => {
  console.error(err)
})
