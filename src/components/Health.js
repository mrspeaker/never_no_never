//@flow
class Health {
  health: number = 1;
  maxHealth: number;
  minHurtTime: number;
  onDie: ?((e:Object)=>void) = null;
  onHurt: ?((health:number, maxHealth:number, e:Object)=>void) = null;

  lastHurt: number = Date.now();

  constructor (health: number, maxHealth: number, minHurtTime: number = 1000) {
    this.health = health;
    this.maxHealth = maxHealth;
    this.minHurtTime = minHurtTime;
  }

  damage (amount: number = 1, e: Object) {
    const now = Date.now();
    if (now - this.lastHurt < this.minHurtTime) {
      return this.health;
    }
    this.lastHurt = now;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.onDie && this.onDie(e);
    }
    else {
      this.onHurt && this.onHurt(this.health, this.maxHealth, e);
    }
    return this.health;
  }

  powerUp (amount: number = 1, e: Object) {
    this.health = Math.min(this.health + amount, this.maxHealth);
    this.onHurt && this.onHurt(this.health, this.maxHealth, e);
  }

}

export default Health;
