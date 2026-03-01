import { Route } from '@angular/router';
import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseFormComponent } from './components/course-form/course-form.component';

export const adminCoursesRoutes: Route[] = [
  { path: '', component: CourseListComponent },
  { path: 'neu', component: CourseFormComponent },
  { path: ':id', component: CourseFormComponent },
];
