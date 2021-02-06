/*-------------------------------------------------------------------------------------------
 * Copyright (c) 2021 Mike Erickson / Codedungeon.  All rights reserved.
 * Licensed under the MIT license.  See LICENSE in the project root for license information.
 * -----------------------------------------------------------------------------------------*/

const _ = require('lodash')
const colors = require('chalk')
const app = require('../toolbox/app')
const Table = require('cli-table3')
const { dd } = require('dumper.js')

module.exports = {
  name: 'info',
  description: 'Get version information for all Laravel projects',
  usage: `${app.getAppName()} info ${colors.magenta('<options>')}`,
  flags: {
    list: { aliases: ['a'], description: 'List of available apps' },
    project: { aliases: ['p'], description: 'Project name (multiple separate with comma)', default: 'laravel' },
    versions: { aliases: ['v'], description: 'Versions (multiple separate with comma)', default: 'v8' },
    limit: { aliases: ['l'], description: 'Limit number of returned items [per version]', default: 1 },
  },
  examples: ['info', 'info --versions 8', 'info --product laravel --limit 5', 'info --product laravel,lumen', 'info --list'],

  async execute(toolbox) {
    //
    // get command options
    let project = toolbox.arguments.project || 'laravel'
    let versions = (toolbox.arguments.versions || 'v5,v6,v7,v8').split(',')
    let limit = toolbox.arguments.limit || 1

    if (project === 'laravel') {
      const api = toolbox.api.create({
        baseURL: 'https://laravelversions.com/api/versions',
        headers: { Accept: 'application/vnd.github.v3+json' },
      })
gs
      const table = new Table({
        head: ['Version', 'Release Date', 'Bug Fix', 'Security Fix Until', ' LTS', 'URL'],
        colWidths: [20, 30, 30, 30, 8], // , 30, 30, 10
      })

      let DATE_FORMAT = 'MMMM MM, YYYY'
      let { data } = await api.get()
      data.data.forEach((row) => {
        let version = row.latest
        let releaseDate = row.released_at ? toolbox.datetime(row.released_at).format(DATE_FORMAT) : ''
        let bugFixesUnti = row.ends_bugfixes_at ? toolbox.datetime(row.ends_bugfixes_at).format(DATE_FORMAT) : 'n/a'
        let securityUntil = row.ends_bugfixes_at ? toolbox.datetime(row.ends_securityfixes_at).format(DATE_FORMAT) : 'n/a'
        let url = row.links.length > 1 ? row.links[1].href : row.links[0].href
        let lts = row.is_lts ? '  ✓' : ' '
        table.push([version, releaseDate, bugFixesUnti, securityUntil, lts, url])
      })

      console.log(table.toString())
      process.exit(0)
    }

    versions = versions.map((item) => {
      return item.includes('v') ? item : 'v' + item
    })

    const api = toolbox.api.create({
      baseURL: 'https://api.github.com',
      headers: { Accept: 'application/vnd.github.v3+json' },
    })

    let { ok, data, status } = await api.get('repos/laravel/framework/releases')
    if (status === 403) {
      console.log()
      toolbox.print.error('API Rate Limit Exceeded', 'ERROR')
      console.log()
      toolbox.print.error(data.message)
      toolbox.print.error(data.documentation_url)
      console.log()
      process.exit(0)
    }

    if (status === 200) {
      let versionResults = []

      versions.forEach((version) => {
        let result = data
          .filter((item) => {
            return item.tag_name.startsWith(version)
          })
          .slice(0, limit)
        result.forEach((item) => {
          versionResults.push(item)
        })
      })

      console.log('')
      toolbox.print.info(project + ` (Limit: ${limit})`)

      const table = new Table({
        head: ['Version', 'Release Date'], // , 'Bug Fix', 'Security Fix Until', 'LTS', 'URL'
        colWidths: [20, 25], // , 30, 30, 10
      })

      let tableData = versionResults.map((row) => {
        let url = row.url
        let releaseDate = toolbox.datetime(row.published_at).format('YYYY-MM-DD HH:mm A')
        let bugFixUntil = toolbox.datetime(row.created_at).format('YYYY-MM-DD HH:mm A')
        let securityUntil = toolbox.datetime(row.created_at).format('YYYY-MM-DD HH:mm A')
        let lts = true ? '✓' : '-'
        // table.push([row.tag_name, releaseDate, bugFixUntil, securityUntil, lts, url])
        table.push([row.tag_name, releaseDate])
      })

      console.log(table.toString())
    } else {
      console.log()
      toolbox.print.error(`Status Code: ${status}`, 'ERROR')
      console.log()
      toolbox.print.error(data.message)
      console.log()
    }
  },
}
