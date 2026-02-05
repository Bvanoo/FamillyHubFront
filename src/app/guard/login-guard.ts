import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Navigation } from '../Services/navigation';

export const loginGuard: CanActivateFn = (route, state) => {
  const _nav = inject(Navigation)
  if (_nav.userName()){
    return true;
  }
  _nav.goToLogin();
  return false;
};