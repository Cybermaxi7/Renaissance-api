export class EmergencyUnpausedEvent {
  constructor(
    public readonly unpausedBy: string | null,
    public readonly reason: string,
    public readonly unpausedAt: string,
  ) {}
}
