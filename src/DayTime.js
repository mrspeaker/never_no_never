class DayTime {

  day = -1;
  time = 0;
  DAY_LENGTH = 100;
  dayOver = false;

  _dayOvers = [];

  addDayOverListener (cb) {
    this._dayOvers.push(cb);
  }

  update (dt) {
    this.time += dt;
    if (this.time >= this.DAY_LENGTH) {
      if (!this.dayOver) {
        this._dayOvers.forEach(cb => cb());
        this.dayOver = true;
      }
    }
  }

  reset () {
    this._dayOvers = [];
    this.day = -2;
    this.wakeUp();
  }

  get firstDayOnTheJob () {
    return this.day <= 0;
  }

  wakeUp () {
    this.day += 1;
    this.dayOver = false;
    this.time = 0;
  }

  get percent () {
    return this.time / this.DAY_LENGTH;
  }

}

const dayTime = new DayTime();

export default dayTime;
