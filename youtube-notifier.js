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
     * Creates an instance of YouTubeNotifier.
     * @param {number} checkInterval - The interval in seconds (minimum 50 seconds) at which to check for new videos.
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
					if (error.message == 'Status code 404') {
						this.emit(YouTubeNotifier.INFO_EVENT, `[YouTubeNotifier] Channel not found. Channel ID: ${channelID}`);
					} else {
						this.emit(YouTubeNotifier.ERROR_EVENT, `[YouTubeNotifier] Error: ${JSON.stringify(error, null, 2)}`);
					}
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

		this.emit(YouTubeNotifier.INFO_EVENT, `[YouTubeNotifier] Started checking for new videos.`);
	}

	/**
	 * Stops checking for new videos.
	 */
	stop() {
		this.emit(YouTubeNotifier.INFO_EVENT, `[YouTubeNotifier] Stopped checking for new videos.`);
		clearInterval(this.#intervalID);
	}

	/**
     * Adds the specified channels to the YouTubeNotifier.
     * @param {...string} channelsIDs - The channel IDs to be added.
     */
	addChannels(...channelsIDs) {
		channelsIDs.forEach(channelID => {
			if (!this.#channels.includes(channelID)) {
				this.#getLatestVideo(channelID)
					.then(video => {
						this.#channels.push(channelID);
						this.#cacheStorage.set(video.id, video.id);
						this.emit(YouTubeNotifier.NEW_VIDEO_EVENT, video);
					})
					.catch(error => {
						this.emit(YouTubeNotifier.ERROR_EVENT, `[YouTubeNotifier] Failed to add channel: ${channelID}\nError: ${JSON.stringify(error, null, 2)}\n`);
					});

			} else {
				this.emit(YouTubeNotifier.INFO_EVENT, `[YouTubeNotifier] Channel already exists: ${channelID}`);
			}
		});

		this.#cacheStorage.set(YouTubeNotifier.#CHANNELS_IDS, this.#channels);
	}
	
	/**
     * Removes the specified channels from the YouTubeNotifier.
     * @param {...string} channelsIDs - The channel IDs to be removed.
     */
	removeChannels(...channelsIDs) {
		channelsIDs.forEach(channelID => {
			if (this.#channels.includes(channelID)) {
				this.#channels = this.#channels.filter(id => id !== channelID);
				this.#cacheStorage.set(YouTubeNotifier.#CHANNELS_IDS, this.#channels);
				this.#cacheStorage.delete(channelID);
				this.emit(YouTubeNotifier.INFO_EVENT, `[YouTubeNotifier] Channel removed: ${channelID}`);

			} else {
				this.emit(YouTubeNotifier.INFO_EVENT, `[YouTubeNotifier] Channel not found: ${channelID}`);
			}
		});
	}
}

module.exports = YouTubeNotifier;
