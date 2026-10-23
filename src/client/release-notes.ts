export const RELEASE_NOTICE_KINDS = ["migration", "added", "improved", "fixed"] as const;
export type ReleaseNoticeKind = typeof RELEASE_NOTICE_KINDS[number];

export interface ReleaseNoticeHighlight {
  kind: ReleaseNoticeKind;
  title: string;
  description?: string;
}

export interface ReleaseNotice {
  id: string;
  version: string;
  highlights: Record<"zh" | "en", ReleaseNoticeHighlight[]>;
}

// The build validates and embeds only the running version's bilingual notice.
export const RELEASE_NOTICE = JSON.parse(__LABNANA_RELEASE_NOTICE_JSON__) as ReleaseNotice;

export function groupReleaseNoticeHighlights(highlights: readonly ReleaseNoticeHighlight[]) {
  return RELEASE_NOTICE_KINDS.flatMap(kind => {
    const items = highlights.filter(item => item.kind === kind);
    return items.length === 0 ? [] : [{ kind, highlights: items }];
  });
}
