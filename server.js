const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Explicitly set the path to ffprobe and ffmpeg binaries
const ffprobePath = 'C:\\ffmpeg\\bin\\ffprobe.exe'; // Update this to the actual path of ffprobe
const ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe'; // Update this to the actual path of ffmpeg

ffmpeg.setFfprobePath(ffprobePath);
ffmpeg.setFfmpegPath(ffmpegPath);

// Serve index.html file on root URL "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Update the '/process' endpoint to return URLs of generated short videos
app.post('/process', async (req, res) => {
  const { youtubeLink } = req.body;
  if (!youtubeLink) {
    return res.json({ success: false, message: 'No YouTube link provided.' });
  }

  const videoId = ytdl.getURLVideoID(youtubeLink);
  const outputDir = path.join(__dirname, 'uploads');
  const videoPath = path.join(outputDir, `${videoId}.mp4`);
  const chunkDuration = 15; // 15 seconds for shorts

  try {
    await downloadVideo(youtubeLink, videoPath);
    const shorts = await generateShorts(videoPath, outputDir, chunkDuration);
    const shortUrls = shorts.map(short => `/uploads/${short}`);
    res.json({ success: true, shortUrls }); // Return URLs instead of filenames
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, message: error.message });
  }
});

function downloadVideo(url, outputPath) {
  return new Promise((resolve, reject) => {
    ytdl(url)
      .pipe(fs.createWriteStream(outputPath))
      .on('finish', resolve)
      .on('error', reject);
  });
}

function generateShorts(filePath, outputDir, chunkDuration) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(new Error('ffprobe not found or unable to analyze video.'));
      }

      const videoDuration = metadata.format.duration;
      const numChunks = Math.ceil(videoDuration / chunkDuration);
      const shorts = [];
      let processedChunks = 0;

      for (let i = 0; i < numChunks; i++) {
        const outputFilePath = path.join(outputDir, `short-${i}.mp4`);
        shorts.push(`short-${i}.mp4`);

        ffmpeg(filePath)
          .setStartTime(i * chunkDuration)
          .setDuration(chunkDuration)
          .output(outputFilePath)
          .on('end', () => {
            processedChunks++;
            if (processedChunks === numChunks) {
              resolve(shorts);
            }
          })
          .on('error', (err) => {
            reject(new Error('Error during video processing: ' + err.message));
          })
          .run();
      }
    });
  });
}

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
