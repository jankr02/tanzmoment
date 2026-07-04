import { Route } from '@angular/router';
import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseEditorComponent } from './course-editor/course-editor.component';

export const adminCoursesRoutes: Route[] = [
  { path: '', component: CourseListComponent },
  { path: 'neu', component: CourseEditorComponent },
  { path: ':id', component: CourseEditorComponent },
];
