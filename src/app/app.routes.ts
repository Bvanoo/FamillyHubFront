import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Calendar } from './calendar/calendar';
import { loginGuard } from './guard/login-guard';
import { Login } from './login/login';

export const routes: Routes = [
    
    {path: "home", component: Home, canActivate: [loginGuard]},
    {path: "calendar", component: Calendar, canActivate: [loginGuard]},
    {path: "login", component: Login},
    {path: "**", redirectTo : 'home'},


];
