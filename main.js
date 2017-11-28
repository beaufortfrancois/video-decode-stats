const protobuf = require('protobufjs');
const levelup = require('levelup')
const leveldown = require('leveldown')

const db = levelup(leveldown('VideoDecodeStats/'))

protobuf.load('video_decode_stats.proto').then(root => {
  const DecodeStatsProto = root.lookupType('media.DecodeStatsProto')
  db.createReadStream().on('data', data => { 
    console.log(data.key.toString(), ' : ', DecodeStatsProto.decode(data.value))
  })
})
