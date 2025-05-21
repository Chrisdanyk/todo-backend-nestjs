export type PaginateFunction = <T, K extends { where?: any; orderBy?: any }>(
  model: {
    count: (args: { where?: any }) => Promise<number>;
    findMany: (args: any) => Promise<T[]>;
  },
  args?: K,
  options?: { page?: number; perPage?: number },
) => Promise<PaginatedResult<T>>;

export interface PaginatedResult<T> {
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
  data: T[];
}

export const createPaginator = (defaultOptions: {
  perPage: number;
}): PaginateFunction => {
  return async <T, K extends { where?: any; orderBy?: any }>(
    model: {
      count: (args: { where?: any }) => Promise<number>;
      findMany: (args: any) => Promise<T[]>;
    },
    args: K = {} as K,
    options: { page?: number; perPage?: number } = {
      page: 1,
      perPage: defaultOptions.perPage,
    },
  ) => {
    const page = Number(options.page) || 1;
    const perPage = Number(options.perPage) || defaultOptions.perPage;

    const skip = page > 0 ? perPage * (page - 1) : 0;
    const [total, data] = await Promise.all([
      model.count({ where: args.where }),
      model.findMany({
        ...args,
        take: perPage,
        skip,
      }),
    ]);

    const lastPage = Math.ceil(total / perPage);

    return {
      meta: {
        total,
        lastPage,
        currentPage: page,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
      data,
    };
  };
};

// Default paginator instance with 10 items per page
export const paginate = createPaginator({ perPage: 5 });
