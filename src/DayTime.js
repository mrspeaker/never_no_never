// @flow
class DayTime {

  day: number = -1;
  time: number = 0;
  DAY_LENGTH: number = 200;
  dayOver: boolean = false;

  _dayOvers: Array<()=>void> = [];

  addDayOverListener (cb: ()=>void) {
    this._dayOvers.push(cb);
  }

  update (dt: number) {
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

  get firstDayOnTheJob (): boolean {
    return this.day <= 0;
  }

  wakeUp () {
    this.day += 1;
    this.dayOver = false;
    this.time = 0;
  }

  get percent (): number {
    return this.time / this.DAY_LENGTH;
  }

}

const dayTime = new DayTime();

export default dayTime;
