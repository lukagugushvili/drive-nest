import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUser } from 'src/interface/current-user';

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();

  return user as ICurrentUser;
});
