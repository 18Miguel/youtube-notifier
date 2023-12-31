const YouTubeNotifier = require('../youtube-notifier');

const notifier = new YouTubeNotifier(30, 'UCGIY_O-8vW4rfX98KlMkvRg', 'crash test', 'UCKy1dAqELo0zrOtPkf0eTMw', 'UC8CX0LD98EDXl4UYX1MDCXg');

notifier.on(notifier.Events.NEW_VIDEO_EVENT, videoInfo => {
  console.log('🆕 New video:', videoInfo);
});

notifier.on(notifier.Events.INFO_EVENT, message => {
  console.warn('\nInfo:\n', message);
});

notifier.on(notifier.Events.ERROR_EVENT, error => {
  console.error('\nError:\n', error);
});


notifier.removeChannels('UCGIY_O-8vW4rfX98KlMkvRg')
  .then((results) => {
    results.forEach((channelInfo) => {
      console.log(channelInfo);
    });
  })
  .catch(error => console.error(error));

notifier.addChannels(false, 'UC8CX0LD98EDXl4UYX1MDCXg', 'UCGIY_O-8vW4rfX98KlMkvRg', 'UCKy1dAqELo0zrOtPkf0eTMw', 'unknown_id', 'unknown_id2')
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
