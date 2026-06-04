export class CooldownTracker {
  private lastTriggered: Map<string, number>;

  constructor() {
    this.lastTriggered = new Map();
  }

  public canTrigger(alertId: string, candleCloseTime: number): boolean {
    const lastTime = this.lastTriggered.get(alertId);
    if (lastTime === undefined) {
      return true;
    }
    return candleCloseTime !== lastTime;
  }

  public recordTrigger(alertId: string, candleCloseTime: number): void {
    this.lastTriggered.set(alertId, candleCloseTime);
  }

  public clear(): void {
    this.lastTriggered.clear();
  }

  public removeAlert(alertId: string): void {
    this.lastTriggered.delete(alertId);
  }
}
