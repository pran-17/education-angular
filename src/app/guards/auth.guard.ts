import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MongoDBService } from '../services/mongodb.service';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const mongo = inject(MongoDBService);

  const user = mongo.getCurrentUser();
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = (route.data && (route.data as any)['roles']) as string[] | undefined;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return router.createUrlTree(['/login']);
  }

  return true;
};



