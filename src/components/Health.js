class Health {
  health = 1;
  onDie = null;
  onHurt = null;

  lastHurt = Date.now();

  constructor (health, maxHealth) {
    this.health = health;
    this.maxHealth = maxHealth;
    this.minHurtTime = 1000;
  }

  damage (amount = 1) {
    const now = Date.now();
    if (now - this.lastHurt < this.minHurtTime) {
      return this.health;
    }
    this.lastHurt = now;
    this.health = Math.max(0, this.health - amount);
    this.onHurt && this.onHurt(this.health, this.maxHealth);
    if (this.health <= 0) {
      this.onDie && this.onDie();
    }
    return this.health;
  }

}

export default Health;
