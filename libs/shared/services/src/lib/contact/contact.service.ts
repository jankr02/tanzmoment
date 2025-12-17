// ============================================================================
// CONTACT SERVICE - IMPLEMENTATION
// ============================================================================

import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import {
  ContactFormDto,
  ContactFormResponse,
  ContactFormError,
  ContactFormErrorType,
} from './contact.types';

/**
 * Service für die Kommunikation mit dem Contact-API-Endpoint.
 *
 * Dieser Service abstrahiert die HTTP-Kommunikation und bietet
 * eine typsichere, getestete Schnittstelle für das Frontend.
 *
 * Design-Entscheidungen:
 * - Automatisches Retry bei Netzwerkfehlern (max. 2x)
 * - 10 Sekunden Timeout (genug für langsame Verbindungen)
 * - Strukturiertes Error-Handling mit klaren Error-Types
 * - Verwendung von modernem inject() statt Constructor-DI
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  // TODO: Später aus Environment-Config laden
  private readonly apiUrl = '/api/contact';

  /**
   * Sendet die Kontaktformular-Daten an das Backend.
   *
   * @param data Die validierten Formulardaten
   * @returns Observable mit der Server-Response
   *
   * @example
   * this.contactService.sendContactForm(formData).subscribe({
   *   next: (response) => console.log('Success:', response.message),
   *   error: (error) => console.error('Error:', error.message)
   * });
   */
  sendContactForm(data: ContactFormDto): Observable<ContactFormResponse> {
    return this.http.post<ContactFormResponse>(this.apiUrl, data).pipe(
      // Timeout nach 10 Sekunden (langsame Verbindungen berücksichtigen)
      timeout(10000),

      // Bei Netzwerkfehlern automatisch 2x wiederholen mit 1s Pause
      // Das hilft bei kurzen Netzwerkunterbrechungen
      retry({
        count: 2,
        delay: 1000,
      }),

      // Fehler in strukturierte Form umwandeln
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Wandelt HTTP-Errors in strukturierte ContactFormErrors um.
   *
   * Diese Methode ist das Herzstück unseres Error-Handlings. Sie analysiert
   * den HTTP-Fehler und erstellt eine benutzerfreundliche Fehlermeldung,
   * die im UI angezeigt werden kann.
   *
   * Die verschiedenen Fehlertypen helfen uns, im Frontend unterschiedlich
   * zu reagieren: Bei NETWORK-Errors zeigen wir z.B. einen Offline-Banner,
   * bei RATE_LIMIT eine Wartezeit, bei VALIDATION die konkreten Feldfehler.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const contactError: ContactFormError = {
      type: ContactFormErrorType.UNKNOWN,
      message: 'Ein unerwarteter Fehler ist aufgetreten.',
      details: error,
    };

    // Network-Error (kein Internet, CORS-Problem, Server down)
    if (error.status === 0) {
      contactError.type = ContactFormErrorType.NETWORK;
      contactError.message =
        'Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.';
    }

    // Validation-Error (Backend hat Eingaben abgelehnt)
    else if (error.status === 400) {
      contactError.type = ContactFormErrorType.VALIDATION;
      contactError.message = 'Bitte überprüfe deine Eingaben.';

      // Falls Backend detaillierte Fehler zurückgibt, diese nutzen
      if (error.error?.message) {
        contactError.message = error.error.message;
      }
    }

    // Rate-Limiting (zu viele Requests)
    else if (error.status === 429) {
      contactError.type = ContactFormErrorType.RATE_LIMIT;
      contactError.message =
        'Zu viele Anfragen. Bitte versuche es in einigen Minuten erneut.';
    }

    // Server-Error (500er Fehler)
    else if (error.status >= 500) {
      contactError.type = ContactFormErrorType.SERVER;
      contactError.message =
        'Server-Fehler. Wir arbeiten bereits an einer Lösung. ' +
        'Bitte versuche es später erneut.';
    }

    // Error in Console loggen für Debugging
    if (isDevMode()) {
      console.error('[ContactService] Error:', contactError);
    }

    return throwError(() => contactError);
  }
}
