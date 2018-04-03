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

// Extracted from https://chromium.googlesource.com/chromium/src/media/+/master/base/video_codecs.h#49
const profiles = {
  0: 'H264PROFILE_BASELINE',
  1: 'H264PROFILE_MAIN',
  2: 'H264PROFILE_EXTENDED',
  3: 'H264PROFILE_HIGH',
  4: 'H264PROFILE_HIGH10PROFILE',
  5: 'H264PROFILE_HIGH422PROFILE',
  6: 'H264PROFILE_HIGH444PREDICTIVEPROFILE',
  7: 'H264PROFILE_SCALABLEBASELINE',
  8: 'H264PROFILE_SCALABLEHIGH',
  9: 'H264PROFILE_STEREOHIGH',
  10: 'H264PROFILE_MULTIVIEWHIGH',
  11: 'VP8PROFILE_ANY',
  12: 'VP9PROFILE_PROFILE0',
  13: 'VP9PROFILE_PROFILE1',
  14: 'VP9PROFILE_PROFILE2',
  15: 'VP9PROFILE_PROFILE3',
  16: 'HEVCPROFILE_MAIN',
  17: 'HEVCPROFILE_MAIN10',
  18: 'HEVCPROFILE_MAIN_STILL_PICTURE',
  19: 'DOLBYVISION_PROFILE0',
  20: 'DOLBYVISION_PROFILE4',
  21: 'DOLBYVISION_PROFILE5',
  22: 'DOLBYVISION_PROFILE7',
  23: 'THEORAPROFILE_MIN',
  24: 'AV1PROFILE_PROFILE0',
}

protobuf.load('video_decode_stats.proto').then(async root => {
  const DecodeStatsProto = root.lookupType('media.DecodeStatsProto')

  // Let's read the database and bail out if there's nothing to write.
  if (!args.file) {
    console.log(['profileId', 'profile', 'resolution', 'frameRate', 'framesDecoded', 'framesDropped', 'framesDecodedPowerEfficient'].join('\t'))
    db.createReadStream().on('data', data => {
      const [profileId, resolution, frameRate] = data.key.toString().split('|')
      const value = DecodeStatsProto.decode(data.value)
      const row = [
        profileId,
        profileId in profiles ? profiles[profileId] : 'VIDEO_CODEC_PROFILE_UNKNOWN',
        resolution,
        frameRate,
        value.framesDecoded.low,
        value.framesDropped.low,
        value.framesDecodedPowerEfficient.low
      ]
      console.log(row.join('\t'))
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
