export class EmergencyPausedEvent {
  constructor(
    public readonly pausedBy: string | null,
    public readonly reason: string,
    public readonly pausedAt: string,
  ) {}
}
