#!/usr/bin/env node

const { CLI, colors } = require('@codedungeon/gunner')
const pkgInfo = require('./package.json')
let parseArgs = require('minimist')

const examples = [
  `${pkgInfo.packageName} (or lv) ${colors.magenta('(executes using default parameters)')}`,
  `${pkgInfo.packageName} (or lv) info --versions 7,8 ${colors.magenta('(shows version 7,8)')}`,
  `${pkgInfo.packageName} (or lv) info --limit 2 ${colors.magenta('(returns 2 rows)')}`,
  `${pkgInfo.packageName} (or lv) info --show-future false ${colors.magenta('(suppress future releases)')}`,
]

const exampleInfo = examples.join('\n  ')

const getLogDirectory = (argv, defaultLocation = 'system') => {
  let logDir = parseArgs(argv)['logDir'] || parseArgs(argv)['log-dir'] || ''
  return logDir.length > 0 ? logDir : defaultLocation
}

const app = new CLI(process.argv, __dirname, pkgInfo)
  .usage(
    `${pkgInfo.packageName} info --limit 5
  lv info --limit 5 ${colors.magenta('(uses `lv` alias)')}`,
  )
  .options(/* if not called, options will be suppressed in help dialog */)
  .examples(exampleInfo)
  .logger({ directory: getLogDirectory(process.argv), alwaysLog: true })
  .hooks({
    beforeExecute: (toolbox, command = '', args = {}) => {
      toolbox.print.write('debug', { hook: 'beforeExecute', command, args, cwd: process.cwd() })
    },
    afterExecute: (toolbox, command = '', args = {}) => {
      toolbox.print.write('debug', { hook: 'afterExecute', command, args })
    },
    commandPrefix: 'make:',
  })
  .run({ default: 'info' })
