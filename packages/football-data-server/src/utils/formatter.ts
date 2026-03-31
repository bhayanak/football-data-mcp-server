import type {
  Competition,
  Match,
  MatchStatus,
  Player,
  Scorer,
  Standing,
  Team,
} from '../api/types.js'

function statusIcon(status: MatchStatus): string {
  switch (status) {
    case 'IN_PLAY':
    case 'PAUSED':
      return '🟢'
    case 'FINISHED':
      return '⚽'
    case 'SCHEDULED':
    case 'TIMED':
      return '🔵'
    case 'POSTPONED':
    case 'CANCELLED':
    case 'SUSPENDED':
      return '🟡'
  }
}

function pad(str: string, len: number): string {
  return str.length >= len ? str.substring(0, len) : str + ' '.repeat(len - str.length)
}

function padStart(str: string, len: number): string {
  return str.length >= len ? str : ' '.repeat(len - str.length) + str
}

function formatDate(utcDate: string): string {
  const d = new Date(utcDate)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(utcDate: string): string {
  const d = new Date(utcDate)
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export function formatCompetitions(competitions: Competition[]): string {
  const lines: string[] = ['Available Competitions', '']
  lines.push(`${pad('Code', 7)}${pad('Competition', 28)}${pad('Area', 16)}Season`)
  lines.push('━'.repeat(70))

  for (const c of competitions) {
    const season = c.currentSeason
      ? `${c.currentSeason.startDate?.substring(0, 4) ?? ''}` +
        (c.currentSeason.endDate ? `-${c.currentSeason.endDate.substring(2, 4)}` : '')
      : ''
    lines.push(`${pad(c.code, 7)}${pad(c.name, 28)}${pad(c.area?.name ?? '', 16)}${season}`)
  }

  return lines.join('\n')
}

export function formatCompetition(c: Competition): string {
  const lines: string[] = [
    `${c.name} (${c.code})`,
    `  Type: ${c.type} | Area: ${c.area?.name ?? 'N/A'}`,
    `  Available Seasons: ${c.numberOfAvailableSeasons}`,
  ]
  if (c.currentSeason) {
    lines.push(
      `  Current Season: ${c.currentSeason.startDate} to ${c.currentSeason.endDate}` +
        (c.currentSeason.currentMatchday ? ` (Matchday ${c.currentSeason.currentMatchday})` : ''),
    )
  }
  return lines.join('\n')
}

export function formatMatches(matches: Match[]): string {
  if (matches.length === 0) return 'No matches found.'

  const lines: string[] = []
  let lastComp = ''

  for (const m of matches) {
    const compName = m.competition?.name ?? ''
    if (compName !== lastComp) {
      if (lines.length > 0) lines.push('')
      lines.push(`${compName}${m.matchday ? ` — Matchday ${m.matchday}` : ''}`)
      lines.push('')
      lastComp = compName
    }

    const icon = statusIcon(m.status)
    const home = m.homeTeam?.shortName ?? m.homeTeam?.name ?? 'TBD'
    const away = m.awayTeam?.shortName ?? m.awayTeam?.name ?? 'TBD'

    if (m.status === 'FINISHED') {
      const hs = m.score?.fullTime?.home ?? 0
      const as = m.score?.fullTime?.away ?? 0
      lines.push(`${icon} ${home} ${hs} - ${as} ${away} (FT)`)
    } else if (m.status === 'IN_PLAY' || m.status === 'PAUSED') {
      const hs = m.score?.fullTime?.home ?? 0
      const as = m.score?.fullTime?.away ?? 0
      lines.push(`${icon} ${home} ${hs} - ${as} ${away} (LIVE)`)
    } else {
      lines.push(`${icon} ${home} vs ${away} (${formatTime(m.utcDate)})`)
      lines.push(`   Status: ${m.status} | ${formatDate(m.utcDate)}`)
    }
  }

  lines.push('')
  lines.push('⚠️ Data may be cached (up to 1 minute delay)')
  return lines.join('\n')
}

export function formatMatch(m: Match): string {
  const lines: string[] = []
  const icon = statusIcon(m.status)
  const home = m.homeTeam?.name ?? 'TBD'
  const away = m.awayTeam?.name ?? 'TBD'

  lines.push(`${m.competition?.name ?? ''} — ${m.stage ?? ''}`)
  lines.push(`${formatDate(m.utcDate)} ${formatTime(m.utcDate)}`)
  lines.push('')

  if (m.status === 'FINISHED' || m.status === 'IN_PLAY' || m.status === 'PAUSED') {
    const ft = m.score?.fullTime
    const ht = m.score?.halfTime
    lines.push(`${icon} ${home} ${ft?.home ?? 0} - ${ft?.away ?? 0} ${away}`)
    if (ht?.home !== null && ht?.away !== null) {
      lines.push(`   Half-time: ${ht?.home} - ${ht?.away}`)
    }
    lines.push(`   Status: ${m.status}`)
  } else {
    lines.push(`${icon} ${home} vs ${away}`)
    lines.push(`   Status: ${m.status}`)
  }

  if (m.score?.duration && m.score.duration !== 'REGULAR') {
    lines.push(`   Duration: ${m.score.duration}`)
  }

  if (m.referees?.length) {
    lines.push(`   Referees: ${m.referees.map((r) => r.name).join(', ')}`)
  }

  lines.push('')
  lines.push(`Match ID: ${m.id}`)
  return lines.join('\n')
}

export function formatStandings(standings: Standing[], competition?: string): string {
  const total = standings.find((s) => s.type === 'TOTAL')
  if (!total || !total.table.length) return 'No standings available.'

  const lines: string[] = [
    `${competition ?? 'League'} — Standings`,
    '',
    `${padStart('Pos', 4)}  ${pad('Team', 20)}${padStart('P', 4)}${padStart('W', 4)}${padStart('D', 4)}${padStart('L', 4)}${padStart('GF', 5)}${padStart('GA', 5)}${padStart('GD', 5)}${padStart('Pts', 5)}  Form`,
    '━'.repeat(75),
  ]

  for (const entry of total.table) {
    const gd = entry.goalDifference >= 0 ? `+${entry.goalDifference}` : `${entry.goalDifference}`
    const form = entry.form ?? ''
    lines.push(
      `${padStart(String(entry.position), 4)}  ${pad(entry.team?.shortName ?? entry.team?.name ?? '', 20)}${padStart(String(entry.playedGames), 4)}${padStart(String(entry.won), 4)}${padStart(String(entry.draw), 4)}${padStart(String(entry.lost), 4)}${padStart(String(entry.goalsFor), 5)}${padStart(String(entry.goalsAgainst), 5)}${padStart(gd, 5)}${padStart(String(entry.points), 5)}  ${form}`,
    )
  }

  lines.push('')
  lines.push('UCL Spots: 1-4 | UEL: 5 | UECL: 6 | Relegation: 18-20')
  return lines.join('\n')
}

export function formatTeam(team: Team): string {
  const lines: string[] = [
    `${team.name}`,
    `  Founded: ${team.founded ?? 'N/A'} | Venue: ${team.venue ?? 'N/A'}`,
    `  Coach: ${team.coach?.name ?? 'N/A'}`,
    `  Website: ${team.website ?? 'N/A'}`,
    `  Address: ${team.address ?? 'N/A'}`,
  ]

  if (team.runningCompetitions?.length) {
    lines.push(`  Competitions: ${team.runningCompetitions.map((c) => c.name).join(', ')}`)
  }

  if (team.squad?.length) {
    lines.push('')
    lines.push(`Squad (${team.squad.length} players):`)

    const grouped: Record<string, string[]> = {
      GK: [],
      DF: [],
      MF: [],
      FW: [],
      Other: [],
    }
    for (const p of team.squad) {
      const name = p.name
      switch (p.position) {
        case 'Goalkeeper':
          grouped.GK.push(name)
          break
        case 'Defence':
          grouped.DF.push(name)
          break
        case 'Midfield':
          grouped.MF.push(name)
          break
        case 'Offence':
          grouped.FW.push(name)
          break
        default:
          grouped.Other.push(name)
      }
    }

    for (const [pos, players] of Object.entries(grouped)) {
      if (players.length) {
        lines.push(`  ${pos}: ${players.join(', ')}`)
      }
    }
  }

  return lines.join('\n')
}

export function formatTeamMatches(matches: Match[], teamName?: string): string {
  if (matches.length === 0) return `No matches found${teamName ? ` for ${teamName}` : ''}.`
  return formatMatches(matches)
}

export function formatPlayer(p: Player): string {
  const lines: string[] = [
    `${p.name}`,
    `  Date of Birth: ${p.dateOfBirth ?? 'N/A'}`,
    `  Nationality: ${p.nationality ?? 'N/A'}`,
    `  Position: ${p.position ?? 'N/A'}`,
  ]
  if (p.shirtNumber) {
    lines.push(`  Shirt Number: ${p.shirtNumber}`)
  }
  if (p.currentTeam) {
    lines.push(`  Current Team: ${p.currentTeam.name}`)
  }
  return lines.join('\n')
}

export function formatScorers(scorers: Scorer[], competition?: string): string {
  if (scorers.length === 0) return 'No scorers found.'

  const lines: string[] = [
    `${competition ?? 'Competition'} — Top Scorers`,
    '',
    `${padStart('Rank', 5)}  ${pad('Player', 22)}${pad('Team', 18)}${padStart('Goals', 6)}${padStart('Asst', 6)}${padStart('Pens', 6)}${padStart('MP', 5)}`,
    '━'.repeat(72),
  ]

  for (let i = 0; i < scorers.length; i++) {
    const s = scorers[i]
    lines.push(
      `${padStart(String(i + 1), 5)}  ${pad(s.player?.name ?? '', 22)}${pad(s.team?.shortName ?? s.team?.name ?? '', 18)}${padStart(String(s.goals ?? 0), 6)}${padStart(String(s.assists ?? 0), 6)}${padStart(String(s.penalties ?? 0), 6)}${padStart(String(s.playedMatches ?? 0), 5)}`,
    )
  }

  return lines.join('\n')
}
