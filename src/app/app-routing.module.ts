import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventsComponent } from './events/events.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventFormComponent } from './event-form/event-form.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'events',
    component: EventsComponent
  },
  {
    path: 'event/:id',
    component: EventDetailComponent
  },
  {
    path: 'create-event',
    component: EventFormComponent
  },
  {
    path: 'edit-event/:id',
    component: EventFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
