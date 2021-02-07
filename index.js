#!/usr/bin/env node

const CLI = require('./src/gunner')
const pkgInfo = require('./package.json')

const app = new CLI(process.argv, __dirname)
  .usage(`${pkgInfo.packageName} info --limit 5`)
  .options(/* if not called, options will be suppressed in help dialog */)
  .version(/* version string override, if not supplied default version info will be displayed */)
  .examples(
    /* if not called, examples will be suppressed in help dialog */
    `${pkgInfo.packageName} info --versions 7,8`,
  )
  .run({ default: 'info' })
