I wanted to be able to read VideoDecodeStats LevelDB database from Chrome OS so...

1. I've deleted `/home/chronos/user/VideoDecodeStats/`
2. Restarted Chrome
3. Played 8K video at https://www.youtube.com/watch?v=n-RjGEWW3nk to populate VideoDecodeStats
4. Copied the VideoDecodeStats folder to this repository
5. Grabbed the proto file
6. And wrote this program

```
$ node main.js 
12|3840x2160|30  :  DecodeStatsProto {
  framesDecoded: Long { low: 127, high: 0, unsigned: true },
  framesDropped: Long { low: 63, high: 0, unsigned: true },
  framesDecodedPowerEfficient: Long { low: 0, high: 0, unsigned: true } }
12|7680x4320|25  :  DecodeStatsProto {
  framesDecoded: Long { low: 91, high: 0, unsigned: true },
  framesDropped: Long { low: 73, high: 0, unsigned: true },
  framesDecodedPowerEfficient: Long { low: 0, high: 0, unsigned: true } }
12|7680x4320|30  :  DecodeStatsProto {
  framesDecoded: Long { low: 519, high: 0, unsigned: true },
  framesDropped: Long { low: 352, high: 0, unsigned: true },
  framesDecodedPowerEfficient: Long { low: 0, high: 0, unsigned: true } }
```

Source: https://cs.chromium.org/chromium/src/media/capabilities/video_decode_stats.proto
