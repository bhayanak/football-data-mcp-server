import { z } from 'zod'
import type { FootballDataClient } from '../api/client.js'
import { formatPlayer } from '../utils/formatter.js'

export const getPlayerSchema = z.object({
  playerId: z.number().describe('Player ID'),
})

export async function getPlayer(client: FootballDataClient, playerId: number): Promise<string> {
  const player = await client.getPlayer(playerId)
  return formatPlayer(player)
}
