declare class YouTubeNotifier  {
  /**
   * Creates an instance of YouTubeNotifier.
   * @param {number} [checkInterval] - The interval in seconds (minimum 50 seconds) at which to check for new videos.
   * @param {...string} [channelsIDs] - The channel IDs to be added.
   * @see {@link VideoInfo} - The structure of the VideoInfo object.
   */
  constructor(checkInterval: number, ...channelsIDs: Array<string>);

  /**
   * @enum {string} Enum for YouTube Notifier events.
   */
  get Events();

  /**
   * @enum {string} Enum for channel addition result.
   */
  get ChannelAdditionResult();

  /**
   * Starts checking for new videos at the specified interval.
   */
  start();
  
  /**
   * Stops checking for new videos.
   */
  stop();

  /**
   * Adds the specified channels to the YouTubeNotifier.
   * @param {boolean} notify - Whether to notify about the latest video of the added channels.
   * @param {...string} channelsIDs - The channel IDs to be added.
   * @returns {Promise<Array<ChannelAdditionInfo>>} A promise that resolves with an array of objects representing the result of each channel addition.
   * @see {@link ChannelAdditionInfo} - The structure of the ChannelAdditionInfo object.
   */
  addChannels(notify, ...channelsIDs);

  /**
   * Removes the specified channels from the YouTubeNotifier.
   * @param {...string} channelsIDs - The channel IDs to be removed.
   * @returns {Promise<Array<ChannelRemovalInfo>>} A promise that resolves with an array of objects representing the result of each channel removal.
   * @see {@link ChannelRemovalInfo} - The structure of the ChannelRemovalInfo object.
   */
  removeChannels(...channelsIDs);

  /**
   * Retrieves the information of the pretended channel.
   * @param {string} channelID - The ID of the YouTube channel.
   * @returns {Promise<ChannelInfo>} A promise that resolves with channel information.
   * @see {@link ChannelInfo} - The structure of the ChannelInfo object.
   */
  async getChannelInfo(channelID);

  /**
   * Retrieves the information of the subscribed channels.
   * @returns {Promise<Array<ChannelInfo>>} A promise that resolves with an array of channel information.
   * @see {@link ChannelInfo} - The structure of the ChannelInfo object.
   */
  async getSubscribedChannels();
}

export = YouTubeNotifier;
