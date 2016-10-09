class Health {
  health = 1;
  onDie = null;
  onHurt = null;

  constructor (health, maxHealth) {
    this.health = health;
    this.maxHealth = maxHealth;
  }

  damage (amount = 1) {
    this.health = Math.max(0, this.health - amount);
    this.onHurt && this.onHurt(this.health, this.maxHealth);
    if (this.health <= 0) {
      this.onDie && this.onDie();
    }
    return this.health;
  }

}

export default Health;
