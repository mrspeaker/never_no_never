class Health {
  health = 1;
  onDie = null;
  onHurt = null;

  lastHurt = Date.now();

  constructor (health, maxHealth, minHurtTime = 1000) {
    this.health = health;
    this.maxHealth = maxHealth;
    this.minHurtTime = minHurtTime;
  }

  damage (amount = 1, e) {
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

}

export default Health;
