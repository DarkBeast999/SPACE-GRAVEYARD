/**
 * Scientific Literature & Archival Source Resolver
 * 
 * Formats primary literature citations into traceable, accessible sources
 * with direct links to NASA NSSDCA, NASA Technical Reports Server (NTRS),
 * NASA Science archives, or publication repositories.
 */

import type { SourceReference } from '../types';

export interface TraceableSource {
  title: string;
  url?: string;
  institution?: string;
  year?: string | number;
  isDirectLink: boolean;
  statusBadge: string;
}

export function resolveSource(
  ref: string | SourceReference,
  artifactAuthoritativeUrl?: string
): TraceableSource {
  if (typeof ref === 'object') {
    return {
      title: ref.title,
      url: ref.url || (ref.doi ? `https://doi.org/${ref.doi}` : undefined),
      institution: ref.authorOrInstitution,
      year: ref.year,
      isDirectLink: Boolean(ref.url || ref.doi),
      statusBadge: ref.verificationStatus === 'verified' ? 'VERIFIED PRIMARY SOURCE' : 'ARCHIVAL CITATION',
    };
  }

  const raw = ref.trim();

  // Match NASA NSSDCA ID
  const nssdcMatch = raw.match(/NSSDCA(?:\s+Master\s+Catalog)?\s+(?:ID|Experiment\s+ID):\s*([0-9]{4}-[0-9A-Z-]+)/i);
  if (nssdcMatch) {
    const id = nssdcMatch[1];
    return {
      title: raw,
      url: artifactAuthoritativeUrl || `https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=${id}`,
      institution: 'NASA Goddard Space Flight Center',
      isDirectLink: true,
      statusBadge: 'OFFICIAL NASA REGISTRY',
    };
  }

  // Match NASA SP / TM report series (e.g. NASA SP-238)
  const reportMatch = raw.match(/NASA\s+(?:SP|TM|CR)-[0-9]+/i);
  if (reportMatch) {
    const reportCode = reportMatch[0].replace(/\s+/g, '+');
    return {
      title: raw,
      url: `https://ntrs.nasa.gov/search?q=${reportCode}`,
      institution: 'NASA Technical Reports Server (NTRS)',
      isDirectLink: true,
      statusBadge: 'NASA TECHNICAL REPORT',
    };
  }

  // Match Science / Nature / Physical Review Letters
  if (/science:|nature:|physical review/i.test(raw)) {
    return {
      title: raw,
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(raw)}`,
      institution: 'Peer-Reviewed Literature',
      isDirectLink: true,
      statusBadge: 'PRIMARY LITERATURE',
    };
  }

  // Match NASA Science or JPL
  if (/NASA Science|NASA JPL|JPL/i.test(raw)) {
    return {
      title: raw,
      url: artifactAuthoritativeUrl || 'https://science.nasa.gov',
      institution: 'NASA / Jet Propulsion Laboratory',
      isDirectLink: true,
      statusBadge: 'NASA MISSION ARCHIVE',
    };
  }

  // Match ESA / Soviet / Lavochkin / IKI
  if (/ESA|Soviet|Lavochkin|IKI RAN|LROC/i.test(raw)) {
    return {
      title: raw,
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(raw)}`,
      institution: 'Institutional Mission Record',
      isDirectLink: true,
      statusBadge: 'ARCHIVAL RECORD',
    };
  }

  return {
    title: raw,
    url: artifactAuthoritativeUrl,
    institution: 'Spacecraft Mission Documentation',
    isDirectLink: Boolean(artifactAuthoritativeUrl),
    statusBadge: 'CURATED ARCHIVE CITATION',
  };
}
