# YouTubeNotifier

YouTubeNotifier allows you to monitor YouTube channels and receive notifications when new videos are uploaded. It provides an event-driven architecture for handling new video events, information events, and error events.

## Installation

```shell
npm install https://github.com/18Miguel/youtube-notifier
```

## Usage

Here's an example of how to use YouTubeNotifier:

```javascript
const YouTubeNotifier = require('youtube-notifier');

// Create an instance of YouTubeNotifier with a check interval of 60 seconds
const notifier = new YouTubeNotifier(60);

// Add YouTube channel IDs to monitor
notifier.addChannels('CHANNEL_ID_1', 'CHANNEL_ID_2');

// Listen for new video events
notifier.on(YouTubeNotifier.NEW_VIDEO_EVENT, videoInfo => {
  console.log(`New video: ${JSON.stringify(videoInfo, null, 2)}`);
});

// Listen for info events
notifier.on(YouTubeNotifier.INFO_EVENT, message => {
  console.log(`Info: ${message}`);
});

// Listen for error events
notifier.on(YouTubeNotifier.ERROR_EVENT, error => {
  console.error(`Error: ${error}`);
});

// Stop monitoring after 10 seconds
setTimeout(() => { notifier.stop(); }, 1000 * 10);
```

## API

### Constructor

#### `new YouTubeNotifier(checkInterval)`

Creates an instance of YouTubeNotifier.

- `checkInterval` (optional): The interval in seconds (minimum 50 seconds) at which to check for new videos.

### Methods

#### `start()`

Starts checking for new videos at the specified interval.

#### `stop()`

Stops checking for new videos.

#### `addChannels(...channelsIDs)`

Adds the specified channel IDs to the YouTubeNotifier.

- `...channelsIDs`: The channel IDs to be added.

#### `removeChannels(...channelsIDs)`

Removes the specified channel IDs from the YouTubeNotifier.

- `...channelsIDs`: The channel IDs to be removed.

### Events

#### `new_video`

Emitted when a new video is found.

#### `info`

Emitted for informational messages.

#### `error`

Emitted when an error occurs.

### VideoInfo Object

The `VideoInfo` object represents information about a YouTube video. It has the following properties:

- `id` (string): The ID of the video.
- `channelID` (string): The ID of the channel that uploaded the video.
- `channelName` (string): The name of the channel that uploaded the video.
- `title` (string): The title of the video.
- `link` (string): The URL link to the video.
- `shortLink` (string): The shortened URL link to the video in the format "https://youtu.be/{id}".
- `publishDate` (string): The publish date of the video in the format "YYYY-MM-DD HH:MM:SS".

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/18Miguel/youtube-notifier/blob/main/LICENSE) file for details.
