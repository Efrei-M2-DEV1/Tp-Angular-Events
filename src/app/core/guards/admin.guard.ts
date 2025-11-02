import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleService } from '../services/role.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private roleService: RoleService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.roleService.isAdmin()) {
      return true;
    }

    // Rediriger vers la home si l'utilisateur n'est pas admin
    console.warn('Access denied: Admin role required');
    this.router.navigate(['/home']);
    return false;
  }
}
