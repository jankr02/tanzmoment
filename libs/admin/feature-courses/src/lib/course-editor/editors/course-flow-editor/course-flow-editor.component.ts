import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CourseDetailCourseFlowContent,
  CourseFlowStep,
} from '@tanzmoment/shared/types';
import { clean, nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-course-flow-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-flow-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFlowEditorComponent implements OnInit {
  @Input() content: CourseDetailCourseFlowContent | undefined;
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailCourseFlowContent | undefined
  >();

  headline = '';
  intro = '';
  steps: CourseFlowStep[] = [];

  ngOnInit(): void {
    this.headline = this.content?.headline ?? '';
    this.intro = this.content?.intro ?? '';
    this.steps = (this.content?.steps ?? []).map((s) => ({ ...s }));
  }

  addStep(): void {
    this.steps = [
      ...this.steps,
      { phase: '', duration: '', description: '' },
    ];
  }

  removeStep(index: number): void {
    this.steps = this.steps.filter((_, i) => i !== index);
    this.emit();
  }

  emit(): void {
    this.contentChange.emit(
      nonEmpty({
        headline: clean(this.headline),
        intro: clean(this.intro),
        steps: this.steps
          .filter((s) => s.phase.trim() || s.description.trim())
          .map((s) => ({ ...s, icon: s.icon?.trim() || undefined })),
      }),
    );
  }
}
