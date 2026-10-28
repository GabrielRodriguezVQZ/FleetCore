import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route as public: the global JwtAuthGuard does not ask for a token. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
