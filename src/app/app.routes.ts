import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Calendar } from './calendar/calendar';
import { loginGuard } from './guard/login-guard';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Nouveaumdp } from './nouveaumdp/nouveaumdp';
// import { Messenger } from './messenger/messenger';
import { Groupes } from './groupes/groupes';
import { Randomizer } from './randomizer/randomizer';
import { Profil } from './profil/profil';
import { GroupDetails } from './group-details/group-details';

export const routes: Routes = [
    
    {path: "home", component: Home, canActivate: [loginGuard]},
    {path: "login", component: Login},
    {path: "calendar", component: Calendar, canActivate: [loginGuard]},
    {path: "signup", component: Signup},
    {path: "randomizer", component: Randomizer},
    {path: "profil", component: Profil},
    {path: "groupes", component: Groupes},
    // {path: "messenger", component: Messenger},
    { path: 'groupes', component: Groupes, canActivate: [loginGuard] },
    { path: 'groupe/:id', component: GroupDetails, canActivate: [loginGuard] },
    {path: "nouveaumdp", component: Nouveaumdp},
    {path: "**", redirectTo : 'home'},


];
