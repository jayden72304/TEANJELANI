export type RawMention = {
  title: string;
  url: string;
  snippet?: string;
  sourceName?: string;
  publishedAt?: Date;
};

export type MentionConnector = {
  id: string;
  label: string;
  search(query: string): Promise<RawMention[]>;
};
