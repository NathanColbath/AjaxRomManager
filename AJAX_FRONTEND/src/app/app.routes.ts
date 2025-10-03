import { Routes } from '@angular/router';
import {RomsComponent} from './roms/roms.component';
import {SystemsComponent} from './systems/systems.component';
import {SystemsManagmentComponent} from './systems-managment/systems-managment.component';
import {SystemsAddComponent} from './systems-add/systems-add.component';
import {SettingsComponent} from './settings/settings.component';


export const routes: Routes = [
  { path: '', redirectTo: '/roms', pathMatch: 'full' },
  { path: 'roms', component: RomsComponent },
  { path: 'systems', component: SystemsComponent },
  { path: 'systems-managment', component: SystemsManagmentComponent },
  { path: 'systems-add', component: SystemsAddComponent },
  { path: 'settings', component: SettingsComponent },
];
