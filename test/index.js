const { channel } = require('diagnostics_channel');
const YouTubeNotifier = require('../youtube-notifier');

const notifier = new YouTubeNotifier(30);

notifier.on(YouTubeNotifier.NEW_VIDEO_EVENT, videoInfo => {
  console.log('New video:', videoInfo);
});

notifier.on(YouTubeNotifier.INFO_EVENT, message => {
  console.warn('\nInfo:\n', message);
});

notifier.on(YouTubeNotifier.ERROR_EVENT, error => {
  console.error('\nError:\n', error);
});


notifier.removeChannels('UCGIY_O-8vW4rfX98KlMkvRg')
  .then((results) => {
    results.forEach((channelInfo) => {
      console.log(channelInfo);
    });
  })
  .catch(error => console.error(error));

notifier.addChannels('UC8CX0LD98EDXl4UYX1MDCXg', 'UCGIY_O-8vW4rfX98KlMkvRg', 'UCKy1dAqELo0zrOtPkf0eTMw', 'unknown_id', 'unknown_id2')
  .then((results) => {
    results.forEach((channelInfo) => {
      console.log(channelInfo);
    });
  })
  .catch(error => console.error(error));


setTimeout(() => {
  notifier.removeChannels('UCGIY_O-8vW4rfX98KlMkvRg')
    .then((results) => {
      results.forEach((channelInfo) => {
        console.log(channelInfo);
      });
    })
    .catch(error => console.error(error));
}, 1000 * 2);

notifier.getSubscribedChannels().then((results) => {
  results.forEach((channelSubscribed) => console.log(channelSubscribed));
});

notifier.getChannelInfo('UCGIY_O-8vW4rfX98KlMkvRg')
  .then(channelInfo => console.log('getChannelInfo: ', channelInfo));

setTimeout(() => notifier.stop(), 1000 * 5);
