var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/'

var findCollection = (dbname, collection, query) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(`${dbname}`)
      //var query = { cle: value }
      dbo.collection(`${collection}`).findOne(query, function (err, result) {
        if (err) throw err
        //console.log(result)
        resolve(result)
        db.close()
      })
    })
  })
}
findMultipleEntries = (dbname, collection, query) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err
      var dbo = db.db(`${dbname}`)
      dbo
        .collection(`${collection}`)
        .find(query)
        .toArray(function (err, result) {
          if (err) throw err
          resolve(result)
          //console.log(result)
          db.close()
        })
    })
  })
}

var findSumOf = async (dbname, collection, regular, startdate, enddate) => {
  return new Promise((resolve, reject) => {
    var query = {
      $and: [
        { ObjectID: new RegExp(regular) },
        { timestamp: { $gte: new Date(startdate), $lte: new Date(enddate) } },
      ],
    }
    findMultipleEntries(`${dbname}`, `${collection}`, query).then((res) => {
      var somme = 0
      resolve(res)
      /*res.map((element, index) => {
        somme += parseFloat(element[sumof].toString())
        if (index === res.length - 1) {
          resolve(somme)
        }
      })*/
    })
  })
}
var findUserRecord = async (
  dbname,
  collection,
  serialNumber,
  startdate,
  enddate
) => {
  var result = await findCollection(`${dbname}`, `${collection}`, {
    SerialNumber: serialNumber,
  })
  //console.log({ res: result })
  var objectName = result.ObjectName.split(':')
  var query = {
    $and: [
      { ObjectID: new RegExp(objectName[1]) },
      { timestamp: { $gte: new Date(startdate), $lte: new Date(enddate) } },
    ],
  }
  findMultipleEntries(`${dbname}`, `${collection}`, query).then((res) => {
    //console.log(res)
  })
}
/*findUserRecord()*/
/*findSumOf(
  'mydb',
  'ONTAggGem',
  'R1.S1.LT8.PON15.ONT44',
  new Date('2021-10-14T06:30:00.885Z'),
  new Date('2021-10-14T08:00:00.885Z')
).then((res) => {
  console.log(res)
})*/

module.exports = {
  findCollection,
  findMultipleEntries,
  findUserRecord,
  findSumOf,
}
