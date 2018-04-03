Media Capabilities Playground
=============================

I wanted to be able to read VideoDecodeStats LevelDB database from Chrome OS so...

1. I've deleted `/home/chronos/user/VideoDecodeStats/`
2. Restarted Chrome
3. Played 8K video at https://www.youtube.com/watch?v=n-RjGEWW3nk to populate VideoDecodeStats
4. Copied the VideoDecodeStats folder to this repository
5. Grabbed the proto file
6. And wrote this program

```
$ node main.js
profileId	profile	resolution	frameRate	framesDecoded	framesDropped	framesDecodedPowerEfficient
12	VP9PROFILE_PROFILE0	3840x2160	30	127	63	0
12	VP9PROFILE_PROFILE0	7680x4320	25	91	73	0
12	VP9PROFILE_PROFILE0	7680x4320	30	519	352	0
```

Then I decided I wanted to write my own data into this database so...

1. I've updated my script to take two parameters:

  - `-d` The directory path of `VideoDecodeStats` so that I can replace inline the database used by Chrome. Note that Chrome needs to be closed when updates are made.
  - `-f` The CSV file that contains new stats. When this is specified, the database is cleaned first.

2. Here's how I use it for instance:

```
more data.csv
12,3840x2160,30,127,12,0
12,320x240,30,127,12,0
12,3840x2160,60,127,12,0
24,3840x2160,60,127,12,0
```

```
node main.js -d /tmp/foo/Default/VideoDecodeStats -f data.csv
/Applications/Chromium.app/Contents/MacOS/Chromium --user-data-dir=/tmp/foo
```

Finally I check out https://beaufortfrancois.github.io/sandbox/media-capabilities/decoding-info-2.html

Notes
=====

The format of the comma separated lines file is:
`profile_id,resolution,frame_rate,frames_decoded,frames_dropped,frames_decoded_power_efficient`

The `profile_id` comes from https://chromium.googlesource.com/chromium/src/media/+/master/base/video_codecs.h#49

Resources
=========

https://cs.chromium.org/chromium/src/media/capabilities/video_decode_stats.proto
