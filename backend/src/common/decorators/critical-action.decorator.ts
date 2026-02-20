import { SetMetadata } from '@nestjs/common';

export const CRITICAL_ACTION_KEY = 'critical_action';

export interface CriticalActionMetadata {
  action: string;
}

export const CriticalAction = (action: string) =>
  SetMetadata(CRITICAL_ACTION_KEY, { action });
