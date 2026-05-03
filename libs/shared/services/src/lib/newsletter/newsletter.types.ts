export type NewsletterSubscriberStatus = 'PENDING' | 'CONFIRMED' | 'UNSUBSCRIBED';

export interface SubscribeRequest {
  email: string;
  consent?: boolean;
  source?: string;
}

export interface SubscriberStatusResponse {
  status: NewsletterSubscriberStatus;
}

export interface UpdatePreferencesRequest {
  subscribed: boolean;
}
