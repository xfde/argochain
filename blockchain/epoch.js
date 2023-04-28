const NtpTimeSync = require("ntp-time-sync").NtpTimeSync;
const EventEmitter = require("events");
const logger = require("../logger");
const { EPOCH_TIME_IN_MS } = require("../config");
class Epoch extends EventEmitter {
  constructor(data) {
    super();
    this.epoch = data != undefined ? data.epoch : 0;
    this.lastEpochTime = 0; // last time we called _nextEpoch
    this.time = undefined; // start time or start time of last epoch
    this.ts = NtpTimeSync.getInstance();
    this.interval = undefined;
  }
  getEpoch() {
    return this.epoch;
  }
  async updateCurrentTime() {
    let t = (await this.ts.getTime()).now.getTime();
    this.time = t;
    return t;
  }

  syncEpoch(data) {
    let curr_time = new Date();
    if (this.lastEpochTime - data.lastEpochTime < 0){
      this.epoch = data.epoch;
      this.lastEpochTime = data.lastEpochTime;
      this.interval = clearInterval(this.interval);
      setTimeout(this._nextEpoch.bind(this), EPOCH_TIME_IN_MS-(curr_time-data.lastEpochTime))
    }
    logger.info("Synced epochs");
  }
  _addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds * 1000);
  }
  _nextEpoch() {
    this.epoch += 1;
    this.lastEpochTime = this.time;
    this.time += EPOCH_TIME_IN_MS;
    // start lottery to elect validator for current epoch
    if (this.interval === undefined){
      this.interval = setInterval(this._nextEpoch.bind(this), EPOCH_TIME_IN_MS);
    }
    this.emit("newEpoch", this.epoch);
  }
}
module.exports = Epoch;
