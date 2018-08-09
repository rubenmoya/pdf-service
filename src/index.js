const express = require('express')
const puppeteer = require('puppeteer')
const _ = require('lodash')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())

const DEFAULT_OPTIONS = {
  printBackground: true,
  format: 'A4',
}

app.post('/', async (req, res) => {
  let { template, variables, options = DEFAULT_OPTIONS } = req.body

  if (_.isEmpty(template)) {
    res.status(400).send({ error: 'template is required' })
  }

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const html = _.template(template)(variables)

  await page.goto(`data:text/html,${html}`, {
    waitUntil: 'networkidle2',
  })

  const buffer = await page.pdf(options)

  await page.close()

  res.set('Content-Type', 'application/pdf')
  res.write(buffer, 'binary')
  res.end(null, 'binary')
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
