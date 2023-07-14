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

// Listen for new video events
notifier.on(YouTubeNotifier.NEW_VIDEO_EVENT, videoInfo => {
  console.log('New video:', videoInfo);
});

// Listen for info events
notifier.on(YouTubeNotifier.INFO_EVENT, message => {
  console.warn('Info:', message);
});

// Listen for error events
notifier.on(YouTubeNotifier.ERROR_EVENT, error => {
  console.error('Error:', error);
});

// Add YouTube channel IDs to monitor
notifier.addChannels('CHANNEL_ID_1', 'CHANNEL_ID_2', 'CHANNEL_ID_3')
  .then((results) => {
    results.forEach((channelInfo) => {
      console.log(channelInfo);
    });
  })
  .catch(error => console.error(error));

// Remove YouTube channel ID after 2 seconds
setTimeout(() => {
  notifier.removeChannels('CHANNEL_ID_2')
    .then((results) => {
      results.forEach((channelInfo) => {
        console.log(channelInfo);
      });
    })
    .catch(error => console.error(error));
}, 1000 * 2);

// Get YouTube channels subscribed information
notifier.getSubscribedChannels().then((results) => {
  results.forEach((channelSubscribed) => console.log(channelSubscribed));
});

// Stop monitoring after 10 seconds
setTimeout(() => notifier.stop(), 1000 * 10);
```

## API

### Constructor

#### `new YouTubeNotifier(checkInterval)`

Creates an instance of YouTubeNotifier.

- `checkInterval` (optional): The interval in seconds (minimum 50 seconds) at which to check for new videos.


### Methods
##

#### `start()`

Starts checking for new videos at the specified interval.

#### `stop()`

Stops checking for new videos.


#### `addChannels(...channelsIDs)`

Adds the specified channel IDs to the YouTubeNotifier.

- `...channelsIDs` (string): The channel IDs to be added.
- Returns: `Promise<Array<ChannelAdditionInfo>>` - A promise that resolves with an array of objects representing the result of each channel addition.

##### ChannelAdditionInfo Object
The structure of the ChannelAdditionInfo object is as follows:
- `success` (boolean): Indicates whether the channel addition was successful.
- `channelID` (string): The ID of the channel being added.
- `video` (VideoInfo): The video information of the latest video from the channel (if success is true).
- `error` (Error): The error object (if success is false).
- `message` (string): A descriptive message about the channel addition (if success is false).

#### `removeChannels(...channelsIDs)`

Removes the specified channel IDs from the YouTubeNotifier.

- `...channelsIDs` (string): The channel IDs to be removed.
- Returns: `Promise<Array<ChannelRemovalInfo>>` - A promise that resolves with an array of objects representing the result of each channel removal.

##### ChannelRemovalInfo Object
The structure of the ChannelRemovalInfo object is as follows:
- `success` (boolean): Indicates whether the channel removal was successful.
- `channelID` (string): The ID of the channel being removed.

#### `getSubscribedChannels()`

Retrieves the information of the subscribed channels. The method returns a promise that resolves with an array of `ChannelSubscribed` objects, representing the subscribed channels' information. If no error occurs, each object will have the `channelID`, `title`, and `link` properties. If an error occurs, the `error` property will contain the error message.

- Returns: `Promise<Array<ChannelSubscribed>>` - A promise that resolves with an array of channel information.

##### ChannelSubscribed Object
The structure of the ChannelSubscribed object is as follows:
- `channelID` (string): The ID of the channel.
- `title` (string): The title of the channel.
- `link` (string): The URL link to the channel.
- `error` (string): The error message if an error occurs while retrieving channel information.


### Events
##

#### `YouTubeNotifier.NEW_VIDEO_EVENT`

Emitted when a new video is found.

##### VideoInfo Object
The `VideoInfo` object represents information about a YouTube video. It has the following properties:
- `id` (string): The ID of the video.
- `channelID` (string): The ID of the channel that uploaded the video.
- `channelName` (string): The name of the channel that uploaded the video.
- `title` (string): The title of the video.
- `link` (string): The URL link to the video.
- `shortLink` (string): The shortened URL link to the video in the format "https://youtu.be/{id}".
- `publishDate` (string): The publish date of the video in the format "YYYY-MM-DD HH:MM:SS".

#### `YouTubeNotifier.INFO_EVENT`

Emitted for informational messages.

#### `YouTubeNotifier.ERROR_EVENT`

Emitted when an error occurs.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/18Miguel/youtube-notifier/blob/main/LICENSE) file for details.
