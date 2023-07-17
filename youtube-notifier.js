const EventEmitter = require('events');
const RSSParser = require('rss-parser');
const FileCache = require('file-cache');

class YouTubeNotifier extends EventEmitter {
	static NEW_VIDEO_EVENT = 'new_video';
	static INFO_EVENT = 'info';
  	static ERROR_EVENT = 'error';
  	static #CHANNELS_IDS = 'channels_ids';
	#parser;
	#cacheStorage;
	#checkInterval;
	#channels;
	#intervalID;

	/**
	 * YouTube video data object.
	 * @typedef {object} VideoInfo
	 * @property {string} id - The ID of the video.
	 * @property {string} channelID - The ID of the channel that uploaded the video.
	 * @property {string} channelName - The name of the channel that uploaded the video.
	 * @property {string} title - The title of the video.
	 * @property {string} link - The URL link to the video.
	 * @property {string} shortLink - The shortened URL link to the video in the format "https://youtu.be/{id}".
	 * @property {string} publishDate - The publish date of the video in the format "YYYY-MM-DD HH:MM:SS".
	 */

	/**
	 * The structure of the ChannelAdditionInfo object.
	 * @typedef {object} ChannelAdditionInfo
	 * @property {boolean} success - Indicates whether the channel was successfully added.
	 * @property {string} channelID - The ID of the channel.
	 * @property {VideoInfo} [videoInfo] - The video information for the added channel (if success is true).
	 * @property {error} [error] - The error object (if success is false).
	 * @property {string} [message] - A descriptive message about the channel addition (if success is false).
	 */
	
	/**
	 * The structure of the ChannelRemovalInfo object.
	 * @typedef {object} ChannelRemovalInfo
	 * @property {boolean} success - Indicates whether the channel was successfully removed.
	 * @property {string} channelID - The ID of the channel.
	 */

	/**
	 * The structure of the ChannelSubscribed object.
	 * @typedef {object} ChannelSubscribed
	 * @property {string} channelID - The ID of the channel.
	 * @property {string} [title] - The title of the channel.
	 * @property {string} [link] - The URL link to the channel.
	 * @property {error} [error] - The error message (if applicable).
	 */

	/**
	 * Creates an instance of YouTubeNotifier.
	 * @param {number} [checkInterval] - The interval in seconds (minimum 50 seconds) at which to check for new videos.
	 * @see {@link VideoInfo} - The structure of the VideoInfo object.
	 */
	constructor(checkInterval) {
		super();
		this.#parser = new RSSParser();
		this.#cacheStorage = new FileCache('cache_storage', __dirname);
		this.#checkInterval = checkInterval
			? checkInterval < 50 ? 50 : checkInterval
			: 60;
		this.#channels = this.#cacheStorage.has(YouTubeNotifier.#CHANNELS_IDS)
			? this.#cacheStorage.take(YouTubeNotifier.#CHANNELS_IDS)
			: [];

		this.#cacheStorage.clear();
		this.#channels.forEach(channelID => this.#getLatestVideo(channelID)
			.then(video => this.#cacheStorage.set(video.id, video.id)));
		this.#cacheStorage.set(YouTubeNotifier.#CHANNELS_IDS, this.#channels);

		this.start();
	}

	/**
	 * Retrieves the latest video for the given channel ID.
	 * @param {string} channelID - The ID of the YouTube channel.
	 * @returns {Promise<VideoInfo>} A Promise that resolves with the latest video information.
	 */
	#getLatestVideo(channelID) {
		return new Promise((resolve, reject) => {
			this.#parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`)
				.then(response => {
					const ITEM = response.items[0];
					const VIDEO = {}

					if (!ITEM)
						resolve(undefined);
					
					VIDEO.id = ITEM.id.replace('yt:video:', '');
					VIDEO.channelID = channelID;
					VIDEO.channelName = ITEM.author;
					VIDEO.title = ITEM.title;
					VIDEO.link = ITEM.link;
					VIDEO.shortLink = `https://youtu.be/${VIDEO.id}`;
					VIDEO.publishDate = `${ITEM.pubDate.split('T')[0]} ${ITEM.pubDate.split('T')[1].replace('.000Z', '')}`;
					
					resolve(VIDEO);
				})
				.catch(error => {
					/* if (error.message == 'Status code 404') {
						this.emit(YouTubeNotifier.INFO_EVENT, `Method: getLatestVideo\nMessage: Channel not found, channel ID ${channelID}.`);
					} else {
						this.emit(YouTubeNotifier.ERROR_EVENT, `Method: getLatestVideo\nError: ${JSON.stringify(error, null, 2)}`);
					} */
					reject(error);
				});
		});
	}

	/**
	 * Starts checking for new videos at the specified interval.
	 */
	start() {
		this.stop();

		this.#intervalID = setInterval(() => {
			this.#channels.forEach(channelID => this.#getLatestVideo(channelID)
				.then(video => {
					if (!this.#cacheStorage.has(video.id)) {
						this.#cacheStorage.set(video.id, video.id);
						this.emit(YouTubeNotifier.NEW_VIDEO_EVENT, video);
					}
				}));
		}, 1000 * this.#checkInterval);

		this.emit(YouTubeNotifier.INFO_EVENT, 'Started checking for new videos.');
	}

	/**
	 * Stops checking for new videos.
	 */
	stop() {
		this.emit(YouTubeNotifier.INFO_EVENT, 'Stopped checking for new videos.');
		clearInterval(this.#intervalID);
	}

	/**
	 * Adds the specified channels to the YouTubeNotifier.
	 * @param {...string} channelsIDs - The channel IDs to be added.
	 * @returns {Promise<Array<ChannelAdditionInfo>>} A promise that resolves with an array of objects representing the result of each channel addition.
	 * @see {@link ChannelAdditionInfo} - The structure of the ChannelAdditionInfo object.
	 */
	addChannels(...channelsIDs) {
		const promises = channelsIDs.map(async (channelID) => {
			if (!this.#channels.includes(channelID)) {
				try {
					const lastVideo = await this.#getLatestVideo(channelID);
					this.#channels.push(channelID);

					if (lastVideo) {
						this.#cacheStorage.set(lastVideo.id, lastVideo.id);
						this.emit(YouTubeNotifier.NEW_VIDEO_EVENT, lastVideo);
					}

					return { success: true, channelID, lastVideo };

				} catch (error) {
					this.emit(YouTubeNotifier.ERROR_EVENT, `Method: addChannels\nMessage: Failed to add channel ID ${channelID}.\nError: ${JSON.stringify(error, null, 2)}\n`);
					return { success: false, channelID, error };
				}
			} else {
				this.emit(YouTubeNotifier.INFO_EVENT, `Method: addChannels\nMessage: Channel ID ${channelID} already added.`);
				return { success: false, channelID, message: 'Channel already added' };
			}
		});
		
		this.#cacheStorage.set(YouTubeNotifier.#CHANNELS_IDS, this.#channels);
		return Promise.all(promises);
	}

	/**
	 * Removes the specified channels from the YouTubeNotifier.
	 * @param {...string} channelsIDs - The channel IDs to be removed.
	 * @returns {Promise<Array<ChannelRemovalInfo>>} A promise that resolves with an array of objects representing the result of each channel removal.
	 * @see {@link ChannelRemovalInfo} - The structure of the ChannelRemovalInfo object.
	 */
	removeChannels(...channelsIDs) {
		const promises = channelsIDs.map(async channelID => {
			if (this.#channels.includes(channelID)) {
				this.#channels = this.#channels.filter(id => id !== channelID);
				this.#cacheStorage.set(YouTubeNotifier.#CHANNELS_IDS, this.#channels);
				this.#cacheStorage.delete(channelID);
				this.emit(YouTubeNotifier.INFO_EVENT, `Method: removeChannels\nMessage: Channel ID ${channelID} removed.`);
		
				return { success: true, channelID };
			} else {
				this.emit(YouTubeNotifier.INFO_EVENT, `Method: removeChannels\nMessage: Channel ID ${channelID} not found.`);
				return { success: false, channelID };
			}
		});
	
		return Promise.all(promises);
	}

	/**
	 * Retrieves the information of the subscribed channels.
	 * @returns {Promise<Array<ChannelSubscribed>>} A promise that resolves with an array of channel information.
	 * @see {@link ChannelSubscribed} - The structure of the ChannelSubscribed object.
	 */
	getSubscribedChannels() {
		const channelPromises = this.#channels.map(channelID => {
		return this.#parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`)
			.then(response => {
				return {
					channelID,
					title: response.title,
					link: response.link
				};
			})
			.catch(error => {
				this.emit(YouTubeNotifier.ERROR_EVENT, error);
				return {
					channelID,
					error: error
				};
			});
		});
	
		return Promise.all(channelPromises);
	}  
}

module.exports = YouTubeNotifier;
