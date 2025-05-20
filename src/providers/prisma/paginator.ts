export type PaginateFunction = <T, K extends { where?: any; orderBy?: any }>(
  model: {
    count: (args: { where?: any }) => Promise<number>;
    findMany: (args: any) => Promise<T[]>;
  },
  args?: K,
  options?: { page?: number; perPage?: number },
) => Promise<PaginatedResult<T>>;

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export const paginator = (defaultOptions: {
  perPage: number;
}): PaginateFunction => {
  return async <T, K extends { where?: any; orderBy?: any }>(
    model: {
      count: (args: { where?: any }) => Promise<number>;
      findMany: (args: any) => Promise<T[]>;
    },
    args: K = {} as K,
    options: { page?: number; perPage?: number } = {},
  ) => {
    const page = Number(options.page) || 1;
    const perPage = Number(options.perPage) || defaultOptions.perPage;

    const skip = page > 0 ? perPage * (page - 1) : 0;
    const [total, data] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      model.count({ where: args.where }),
      model.findMany({
        ...args,
        take: perPage,
        skip,
      }),
    ]);

    const lastPage = Math.ceil(total / perPage);

    return {
      data,
      meta: {
        total,
        lastPage,
        currentPage: page,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  };
};
