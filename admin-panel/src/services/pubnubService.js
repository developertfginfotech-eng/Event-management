import PubNub from 'pubnub';

class PubNubService {
  constructor() {
    this.pubnub = null;
    this.userId = null;
    this.currentChannels = [];
    this.listeners = {};
  }

  initialize(userId, authToken) {
    this.userId = userId;

    this.pubnub = new PubNub({
      publishKey: import.meta.env.VITE_PUBNUB_PUBLISH_KEY,
      subscribeKey: import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY,
      uuid: `user-${userId}`,
      authKey: authToken,
      ssl: true,
      restore: true,
      heartbeatInterval: 30
    });

    console.log('PubNub initialized for user:', userId);
    return this.pubnub;
  }

  subscribe(channelId, messageCallback, presenceCallback, statusCallback, isDM = false) {
    if (!this.pubnub) {
      console.error('PubNub not initialized');
      return;
    }

    // Support both event channels and DM channels
    const channel = isDM ? channelId : `event-${channelId}`;

    // Create listener for this channel
    const listener = {
      message: (event) => {
        if (event.channel === channel && messageCallback) {
          messageCallback(event.message);
        }
      },
      presence: (event) => {
        if (event.channel === channel && presenceCallback) {
          presenceCallback(event);
        }
      },
      status: (event) => {
        if (statusCallback) {
          statusCallback(event);
        }
        console.log('PubNub status:', event.category);
      }
    };

    // Add listener
    this.pubnub.addListener(listener);
    this.listeners[channel] = listener;

    // Subscribe to channel with presence
    this.pubnub.subscribe({
      channels: [channel],
      withPresence: true
    });

    this.currentChannels.push(channel);
    console.log('Subscribed to channel:', channel);
  }

  unsubscribe(channelId, isDM = false) {
    if (!this.pubnub) return;

    const channel = isDM ? channelId : `event-${channelId}`;

    // Remove listener
    if (this.listeners[channel]) {
      this.pubnub.removeListener(this.listeners[channel]);
      delete this.listeners[channel];
    }

    // Unsubscribe from channel
    this.pubnub.unsubscribe({
      channels: [channel]
    });

    this.currentChannels = this.currentChannels.filter(ch => ch !== channel);
    console.log('Unsubscribed from channel:', channel);
  }

  async publish(channelId, message, isDM = false) {
    if (!this.pubnub) {
      throw new Error('PubNub not initialized');
    }

    const channel = isDM ? channelId : `event-${channelId}`;

    try {
      const response = await this.pubnub.publish({
        channel: channel,
        message: message
      });

      return response;
    } catch (error) {
      console.error('PubNub publish error:', error);
      throw error;
    }
  }

  async fetchHistory(channelId, start, count = 50, isDM = false) {
    if (!this.pubnub) {
      throw new Error('PubNub not initialized');
    }

    const channel = isDM ? channelId : `event-${channelId}`;

    try {
      const response = await this.pubnub.fetchMessages({
        channels: [channel],
        count: count,
        start: start,
        stringifiedTimeToken: true
      });

      return response.channels[channel] || [];
    } catch (error) {
      console.error('PubNub fetch history error:', error);
      throw error;
    }
  }

  async getHereNow(channelId, isDM = false) {
    if (!this.pubnub) {
      throw new Error('PubNub not initialized');
    }

    const channel = isDM ? channelId : `event-${channelId}`;

    try {
      const response = await this.pubnub.hereNow({
        channels: [channel],
        includeUUIDs: true,
        includeState: true
      });

      return response.channels[channel] || { occupancy: 0, occupants: [] };
    } catch (error) {
      console.error('PubNub hereNow error:', error);
      return { occupancy: 0, occupants: [] };
    }
  }

  disconnect() {
    if (this.pubnub) {
      // Unsubscribe from all channels
      if (this.currentChannels.length > 0) {
        this.pubnub.unsubscribeAll();
      }

      // Remove all listeners
      Object.keys(this.listeners).forEach(channel => {
        this.pubnub.removeListener(this.listeners[channel]);
      });

      this.listeners = {};
      this.currentChannels = [];
      this.pubnub = null;
      this.userId = null;

      console.log('PubNub disconnected');
    }
  }
}

export default new PubNubService();
