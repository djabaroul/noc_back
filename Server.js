//var fetchDatac = require('./fetchdatac.js')
var shortcut = require('./file-processing/short-cut')
var admin_olt = require('./OLT_ONT/admin')
var findInDb = require('./db-operations/findInDb')

var express = require('express')
const cors = require('cors')
const cron = require('node-cron')
const { query } = require('express')
const app = express()

//chaque 16 Minute (16 * * * *)
cron.schedule('1,16,31,46 0-23 * * *', function () {
  admin_olt.OLT.map((element) => {
    shortcut.minuteShortcut(element)
  })
  console.log('download each 16 minute')
})

//chaque 1h 1 minute (1 0-23 * * *)
cron.schedule('1 0-23 * * *', function () {
  admin_olt.OLT.map((element) => {
    shortcut.hourShortcut(element)
  })
  console.log('download each hour past 1 minute')
})

//chaque Jour a 0 H 1 min du 1 au 31 (1 0 1-31 * *)
cron.schedule('1 0 1-31 * *', function () {
  admin_olt.OLT.map((element) => {
    shortcut.dayShortcut(element)
  })
  console.log('download each day at 0 AM past 1 minute')
})

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

//recuperation d'un record d'information cliente
app.get('/getcollection', async function (req, res) {
  findInDb
    .findCollection(req.dbname, req.collection, req.query)
    .then((result) => {
      res.send(result)
    })
})

//recuperation de certains enregistrement en fonction de la date
app.get('/getEntries', async function (req, res) {
  findInDb
    .findMultipleEntries(req.dbname, req.collection, req.query)
    .then((result) => {
      res.send(result)
    })
})

//recuperation des informations propre a un utilisateur
app.get('/getUserRecord', async function (req, res) {
  findInDb
    .findUserRecord(
      req.dbname,
      req.collection,
      req.serialNumber,
      req.startdate,
      req.enddate
    )
    .then((result) => {
      res.send(result)
    })
})

//somme d'une colonne en particulier en fonction du temps
app.get('/getSum', async function (req, res) {
  console.log({ request: req.query })
  findInDb
    .findSumOf(
      req.query.dbname,
      req.query.collection,
      req.query.regular,
      req.query.start,
      req.query.end
    )
    .then((result) => {
      console.log({ resultat: result })
      res.send(result)
    })
})

app.get('/data', async function (req, res) {
  var resultingPath = await fetchDatac.AllPaths()
  console.log(resultingPath.minutes)
  var data = await fetchDatac.getJson(
    resultingPath.minutes,
    'iSAM_bridgePort15MinHistoryData'
  )

  console.log({ data: data })
  res.send(data)
})

app.get('/ont', async function (req, res) {
  console.log({ request: req.query.regular })
  query = {
    ObjectID: { $regex: `${req.query.regular}` },
  }
  findInDb
    .findMultipleEntries(
      `${req.query.dbname}`,
      `${req.query.collection}`,
      query
    )
    .then((result) => {
      res.send(result)
    })
})

app.listen(3001)
/**/
