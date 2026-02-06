const PubNub = require('pubnub');

// Initialize PubNub instance
const pubnub = new PubNub({
  publishKey: process.env.PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
  secretKey: process.env.PUBNUB_SECRET_KEY,
  uuid: `${Date.now()}-server`,
  ssl: true
});

// Generate PubNub auth token for a user
const generatePubNubToken = async (userId, eventIds, ttl = 1440) => {
  try {
    // TTL in minutes (default 24 hours = 1440 minutes)
    const permissions = {
      resources: {
        channels: {}
      },
      patterns: {},
      meta: {
        userId: userId.toString()
      }
    };

    // Grant access to event channels
    eventIds.forEach(eventId => {
      const channelName = `event-${eventId}`;
      permissions.resources.channels[channelName] = {
        read: true,
        write: true,
        get: true
      };
    });

    const tokenResponse = await pubnub.grantToken({
      ttl: ttl,
      authorized_uuid: `user-${userId}`,
      resources: permissions.resources,
      patterns: permissions.patterns,
      meta: permissions.meta
    });

    return {
      token: tokenResponse,
      ttl: ttl
    };
  } catch (error) {
    console.error('PubNub token generation error:', error);
    throw error;
  }
};

// Publish message to PubNub channel
const publishMessage = async (channel, message) => {
  try {
    const publishPayload = {
      channel: channel,
      message: message
    };

    const response = await pubnub.publish(publishPayload);
    return response;
  } catch (error) {
    console.error('PubNub publish error:', error);
    throw error;
  }
};

// Fetch message history from PubNub
const fetchHistory = async (channel, count = 100, start = null, end = null) => {
  try {
    const params = {
      channel: channel,
      count: count,
      stringifiedTimeToken: true
    };

    if (start) params.start = start;
    if (end) params.end = end;

    const response = await pubnub.fetchMessages(params);
    return response;
  } catch (error) {
    console.error('PubNub fetch history error:', error);
    throw error;
  }
};

// Generate channel name for event
const getEventChannelName = (eventId) => {
  return `event-${eventId}`;
};

module.exports = {
  pubnub,
  generatePubNubToken,
  publishMessage,
  fetchHistory,
  getEventChannelName
};
