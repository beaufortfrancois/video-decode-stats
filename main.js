const ArgumentParser = require ('argparse').ArgumentParser
const protobuf = require('protobufjs')
const levelup = require('levelup')
const leveldown = require('leveldown')

const parser = new ArgumentParser({ version: '1.0', addHelp: true, })
parser.addArgument(['-d', '--dir'], {help: 'VideoDecodeStats directory path', defaultValue: 'VideoDecodeStats'})
parser.addArgument(['-f', '--file'], {help: 'CSV file to write into VideoDecodeStats'})

const fs = require('fs-extra')

const args = parser.parseArgs();
if (args.file) {
  // Let's start fresh if user wants to add new stats.
  fs.removeSync(args.dir)
}
const db = levelup(leveldown(args.dir))

const readline = require('readline')
const stream =  require('stream')

protobuf.load('video_decode_stats.proto').then(async root => {
  const DecodeStatsProto = root.lookupType('media.DecodeStatsProto')

  // Let's read the database and bail out if there's nothing to write.
  if (!args.file) {
    db.createReadStream().on('data', data => {
      console.log(data.key.toString(), ' : ', DecodeStatsProto.decode(data.value))
    })
    return;
  }

  const inStream = fs.createReadStream(args.file)
  const rl = readline.createInterface(inStream, new stream)

  rl.on('line', async line => {
    const [profileId, resolution, frameRate, framesDecoded, framesDropped, framesDecodedPowerEfficient] = line.split(',')
    const key = [profileId, resolution, frameRate].join('|')
    const payload = {framesDecoded, framesDropped, framesDecodedPowerEfficient}
    const value = DecodeStatsProto.encode(payload).finish()
    console.log(key, value);

    await db.put(key, value)
  });
})
