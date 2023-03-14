const NtpTimeSync = require("ntp-time-sync").NtpTimeSync;
const EventEmitter = require("events");
const logger = require("../logger");
const { EPOCH_TIME_IN_MS } = require("../config");
class Epoch extends EventEmitter {
  constructor(data) {
    super();
    this.epoch = data != undefined ? data.epoch : 0;
    this.lastEpochTime = 0;
    this.time = undefined;
    this.ts = NtpTimeSync.getInstance();
    this.interval = setInterval(this._nextEpoch.bind(this), EPOCH_TIME_IN_MS);
  }
  getEpoch() {
    return this.epoch;
  }
  async updateCurrentTime() {
    let t = (await this.ts.getTime()).now.getTime();
    this.time = t;
    logger.debug("Time is: " + new Date(t));
    return t;
  }

  syncEpoch(data) {
    this.epoch = data.epoch;
    this.lastEpochTime = data.lastEpochTime;
    this.time = data.time;
    logger.debug("Synced epochs");
    logger.debug(
      "\nCurrent epoch:" + this.epoch + "\nCurrent time: " + new Date(this.time)
    );
  }
  _addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds * 1000);
  }
  _nextEpoch() {
    this.epoch += 1;
    this.lastEpochTime = this.time;
    this.time += EPOCH_TIME_IN_MS;
    // start lottery to elect validator for current epoch
    this.emit("newEpoch", this.epoch);
  }
}
module.exports = Epoch;
