'use strict';

const audioType = require('audio-type');
const WavDecoder = require('wav-decoder');
const DecoderUtils = require('./utils/DecoderUtils');
const AudioDataUtils = require('./utils/AudioDataUtils');
const AudioBuffer = require('./api/AudioBuffer');

const decoders = {};

/**
 * @param {string}    type
 * @return {function}
 */
function get(type) {
  return decoders[type] || null;
}

/**
 * @param {string}   type
 * @param {function} fn
 */
function set(type, fn) {
  /* istanbul ignore else */
  if (typeof fn === 'function') {
    decoders[type] = fn;
  }
}

/**
 * @param {ArrayBuffer} AudioBuffer
 * @param {object}      opts
 * @return {Promise<AudioData>}
 */
function decode(audioData, opts) {
  const type = toAudioType(audioData);
  const decodeFn = decoders[type];

  if (typeof decodeFn !== 'function') {
    return Promise.reject(new TypeError(
        `Decoder does not support the audio format: ${type || 'unknown'}`));
  }

  return DecoderUtils.decode(decodeFn, audioData, opts).then((audioData) => {
    return AudioDataUtils.toAudioBuffer(audioData, AudioBuffer);
  });
}

function toAudioType(audioData) {
  return audioType(new Uint8Array(audioData, 0, 16)) || '';
}

set('wav', WavDecoder.decode);

module.exports = {
  get,
  set,
  decode
};
