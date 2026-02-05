// apps/api/src/routes/share/share.service.ts
import { shareTokenRepository } from '../../repositories/shareToken.repository.js';
import { NotFoundError } from '@repo/shared/errors';
import { mapToSharedSpotResponse, type SharedSpotResponse } from './types.js';

/**
 * Share service - business logic for public shared spot access
 */
export const shareService = {
  /**
   * Get a shared spot by token (public - no auth required)
   * Returns null-safe spot data without user info
   */
  async getSharedSpot(token: string): Promise<SharedSpotResponse> {
    const shareData = await shareTokenRepository.findByToken(token);

    if (!shareData) {
      throw new NotFoundError('Shared link not found or expired');
    }

    return mapToSharedSpotResponse(shareData.spot, shareData.expiresAt);
  },
};
