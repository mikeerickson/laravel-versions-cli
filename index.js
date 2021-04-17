#!/usr/bin/env node

const { CLI, colors } = require('@codedungeon/gunner')
const pkgInfo = require('./package.json')

const examples = [
  `${pkgInfo.packageName} (or lv) ${colors.magenta('(executes using default parameters)')}`,
  `${pkgInfo.packageName} (or lv) info --versions 7,8 ${colors.magenta('(shows version 7,8)')}`,
  `${pkgInfo.packageName} (or lv) info --limit 2 ${colors.magenta('(returns 2 rows)')}`,
  `${pkgInfo.packageName} (or lv) info --show-future false ${colors.magenta('(suppress future releases)')}`,
]

const exampleInfo = examples.join('\n  ')

const app = new CLI(process.argv, __dirname, pkgInfo)
  .usage(
    `${pkgInfo.packageName} info --limit 5
  lv info --limit 5 ${colors.magenta('(uses `lv` alias)')}`,
  )
  .options(/* if not called, options will be suppressed in help dialog */)
  .examples(exampleInfo)
  .run({ default: 'info' })
