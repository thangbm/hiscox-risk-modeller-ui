import type { RegisteredDatabase } from '@/types/api';
import type { MatchMode } from '@/features/data-import/types/dataImport';

/**
 * Splits a raw search box value into terms on whitespace. Empty input (or only
 * whitespace) yields no terms, which callers treat as "no filter".
 */
export const parseSearchTerms = (query: string): string[] =>
  query.trim().split(/\s+/).filter(Boolean);

/**
 * Case-insensitive substring match of every/any term, mirroring SQL
 * `LIKE '%term%'` combined with AND or OR.
 */
export const matchesTerms = (
  value: string,
  terms: string[],
  matchMode: MatchMode,
): boolean => {
  const haystack = value.toLowerCase();
  const test = (term: string) => haystack.includes(term.toLowerCase());
  return matchMode === 'AND' ? terms.every(test) : terms.some(test);
};

/**
 * Filters registered databases by name. No terms means the list is returned
 * unchanged, so an empty search box shows everything.
 */
export const filterDatabases = (
  databases: RegisteredDatabase[],
  query: string,
  matchMode: MatchMode,
): RegisteredDatabase[] => {
  const terms = parseSearchTerms(query);
  if (terms.length === 0) return databases;
  return databases.filter((database) => matchesTerms(database.name, terms, matchMode));
};
