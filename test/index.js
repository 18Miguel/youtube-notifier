const YouTubeNotifier = require('../youtube-notifier');

const notifier = new YouTubeNotifier(30);

notifier.on(YouTubeNotifier.NEW_VIDEO_EVENT, videoInfo => {
  console.log(`New video: ${JSON.stringify(videoInfo, null, 2)}`);
});

notifier.on(YouTubeNotifier.INFO_EVENT, message => {
  console.warn(`Info: ${message}`);
});

notifier.on(YouTubeNotifier.ERROR_EVENT, error => {
  console.error(`Error: ${error}`);
});

notifier.addChannels('UC8CX0LD98EDXl4UYX1MDCXg', 'UCGIY_O-8vW4rfX98KlMkvRg', 'UCKy1dAqELo0zrOtPkf0eTMw');

//notifier.removeChannels('UCGIY_O-8vW4rfX98KlMkvRg');
notifier.addChannels('UCGIY_O-8vW4rfX98KlMkvRg');

setTimeout(() => { notifier.stop(); }, 1000 * 10);