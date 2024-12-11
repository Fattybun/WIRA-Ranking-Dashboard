export interface RankingQueryParams {
  page?: number;
  pageSize?: number;
  classID?: number;
  search?: string;
}

export interface RankingResult {
  username: string;
  class_id: number;
  top_score: number;
  rank: number;
}
