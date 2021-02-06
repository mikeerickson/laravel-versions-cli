/*-------------------------------------------------------------------------------------------
 * Copyright (c) 2021 Mike Erickson / Codedungeon.  All rights reserved.
 * Licensed under the MIT license.  See LICENSE in the project root for license information.
 * -----------------------------------------------------------------------------------------*/

const _ = require('lodash')
const colors = require('chalk')
const Table = require('cli-table3')
const app = require('../toolbox/app')

let future = colors.blue
let security = colors.yellow
let eol = colors.redBright
let bug = colors.green
let heading = colors.blue.bold

module.exports = {
  name: 'info',
  description: 'Get version information for all Laravel projects',
  usage: `${app.getAppName()} info ${colors.magenta('<options>')}`,
  flags: {
    list: { aliases: ['a'], description: 'List of available apps' },
    project: { aliases: ['p'], description: 'Project name (multiple separate with comma)', default: 'laravel' },
    versions: { aliases: ['v'], description: 'Versions (multiple separate with comma)', default: 'v8' },
    limit: { aliases: ['l'], description: `Limit number of returned items ${colors.yellow.dim('(will always show upcoming releases)')}`, default: 1 },
  },
  examples: ['info', 'info --versions 8', 'info --product laravel --limit 5', 'info --product laravel,lumen', 'info --list'],

  async execute(toolbox) {
    let project = toolbox.arguments.project || 'laravel'
    if (project === 'laravel' || project === 'framework') {
      this._showLaravelVersionsInfo(toolbox)
    } else {
      this._showLaravelGitHubInfo(toolbox)
    }
  },

  async _showLaravelVersionsInfo(toolbox) {
    let limit = toolbox.arguments.limit || null

    const api = toolbox.api.create({
      baseURL: 'https://laravelversions.com/api/versions',
      headers: { Accept: 'application/vnd.github.v3+json' },
    })

    const table = new Table({
      head: ['Version', 'Release Date', 'Bug Fix', 'Security Fix Until', 'Status', ' LTS', 'URL'], // , 'API URL'
      colWidths: [20, 30, 30, 30, 15, 8, 35], // , 30, 30, 10
    })

    let DATE_FORMAT = 'MMMM MM, YYYY'
    let { data } = await api.get()
    if (limit) {
      data.data = data.data.slice(0, limit)
    }

    data.data.forEach((row) => {
      let version = row.latest
      let releaseDate = row.released_at ? toolbox.datetime(row.released_at).format(DATE_FORMAT) : ''
      let bugFixesUntil = row.ends_bugfixes_at ? toolbox.datetime(row.ends_bugfixes_at).format(DATE_FORMAT) : 'n/a'
      let securityUntil = row.ends_bugfixes_at ? toolbox.datetime(row.ends_securityfixes_at).format(DATE_FORMAT) : 'n/a'
      let url = `https://laravelversions.com/${row.major}`
      if (row.major <= 5) {
        url = `https://laravelversions.com/${row.major}.${row.minor}`
      }
      let apiUrl = row.links.length > 1 ? row.links[1].href : row.links[0].href
      let lts = row.is_lts ? '  ✓' : ' '
      let status = row.status

      /*eslint-disable */
      let color = eol
      switch (row.major) {
        case 8:
          color = bug
          break
        case 7:
          color = security
          break
        case 6:
          color = bug
          break
      }
      /*eslint-enable */
      table.push([`${color(version)}`, `${color(releaseDate)}`, `${color(bugFixesUntil)}`, `${color(securityUntil)}`, `${color(status)}`, `${color(lts)}`, `${color(url)}`]) // apiUrl
    })

    table.insert(0, [
      `${future('9')}`,
      `${future('September, 2021 (estimated)')}`,
      `${future('September, 2023 (estimated)')}`,
      `${future('September, 2024 (estimated)')}`,
      `${future('not released')}`,
      `${future('  ✓')}`,
      `${future('https://laravelversions.com/9')}`,
    ])
    table.insert(0, [
      `${future('10')}`,
      `${future('September, 2022 (estimated)')}`,
      `${future('March, 2024 (estimated)')}`,

      `${future('September, 2024 (estimated)')}`,
      `${future('not released')}`,
      '',
      `${future('https://laravelversions.com/10')}`,
    ])

    console.log('')
    let oldestVersion = data.data[data.data.length - 1].latest
    let latestVersion = data.data[0].latest

    console.log(heading(`Laravel Version Information (v${oldestVersion} - v${latestVersion})`))
    console.log(`${colors.magenta('Data Courtesy of Laravel Versions -- https://laravelversions.com/')}`)
    console.log(colors.italic(`Legend: ${eol('End of Life')}, ${security('Security fixes only')}, ${bug('Bug and security fixes')}, ${future('Future Release')}\n`))

    console.log(table.toString())
    process.exit(0)
  },

  async _showLaravelGitHubInfo(toolbox) {
    let project = toolbox.arguments.project || 'laravel'
    let versions = (toolbox.arguments.versions || 'v5,v6,v7,v8').split(',')
    let limit = toolbox.arguments.limit || 1

    let DATE_FORMAT = 'MMMM MM, YYYY'

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
        head: ['Version', 'Release Date', 'Created'], // , 'Bug Fix', 'Security Fix Until', 'LTS', 'URL'
        colWidths: [20, 25, 25], // , 30, 30, 10
      })

      let tableData = versionResults.map((row) => {
        let url = row.url
        let releaseDate = toolbox.datetime(row.published_at).format(DATE_FORMAT)
        let createDate = toolbox.datetime(row.created_at).format(DATE_FORMAT)
        table.push([row.tag_name, releaseDate, createDate])
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
