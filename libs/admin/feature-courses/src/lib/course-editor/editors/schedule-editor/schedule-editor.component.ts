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
import { CourseDetailScheduleContent } from '@tanzmoment/shared/types';
import { AdminSession } from '@tanzmoment/admin/data-access';
import { clean, nonEmpty } from '../shared/normalize';

@Component({
  selector: 'admin-schedule-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-editor.component.html',
  styleUrls: ['../shared/editor-fields.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleEditorComponent implements OnInit {
  @Input() content: CourseDetailScheduleContent | undefined;
  @Input() sessions: AdminSession[] = [];
  @Output() readonly contentChange = new EventEmitter<
    CourseDetailScheduleContent | undefined
  >();

  headline = '';
  infoText = '';
  sessionLabels: Record<string, string> = {};

  ngOnInit(): void {
    this.headline = this.content?.headline ?? '';
    this.infoText = this.content?.infoText ?? '';
    this.sessionLabels = { ...(this.content?.sessionLabels ?? {}) };
  }

  formatSession(session: AdminSession): string {
    return `${new Date(session.startTime).toLocaleDateString('de-DE')} · ${
      session.locationName
    }`;
  }

  onLabelChange(sessionId: string, value: string): void {
    this.sessionLabels = { ...this.sessionLabels, [sessionId]: value };
    this.emit();
  }

  emit(): void {
    const knownIds = new Set(this.sessions.map((s) => s.id));
    const labels: Record<string, string> = {};
    for (const [id, label] of Object.entries(this.sessionLabels)) {
      if (label?.trim() && knownIds.has(id)) {
        labels[id] = label.trim();
      }
    }
    this.contentChange.emit(
      nonEmpty({
        headline: clean(this.headline),
        infoText: clean(this.infoText),
        sessionLabels: Object.keys(labels).length ? labels : undefined,
      }),
    );
  }
}
