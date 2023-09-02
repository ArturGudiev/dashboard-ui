export interface IListResponse<T> {
  listInfo: {
    count: number,
  },
  items: T[]
}
