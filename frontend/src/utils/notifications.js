// Rend le titre + corps d'une notification dans la langue COURANTE, à partir de
// son discriminant `data.event` (posé par NotificationService). Ainsi une
// notification suit la langue choisie, même après un changement de langue.
//
// Repli : pour les anciennes notifications sans `event`, on affiche le texte
// stocké en base (title/content).
export function renderNotification(notification, t) {
  const data = notification.data || {};

  switch (data.event) {
    case 'new_message':
      return {
        title: t('notifications.render.new_message', { name: data.actor_name || '' }),
        body: notification.content, // extrait du message : contenu utilisateur, non traduit
      };
    case 'rent_request':
      return {
        title: t('notifications.render.rent_request', { name: data.actor_name || '' }),
        body: t('notifications.render.rent_request_body', { listing: data.listing_title || '' }),
      };
    case 'demand_accepted':
      return {
        title: t('notifications.render.demand_accepted_title'),
        body: t('notifications.render.demand_accepted_body', { name: data.actor_name || '', listing: data.listing_title || '' }),
      };
    case 'demand_refused':
      return {
        title: t('notifications.render.demand_refused_title'),
        body: t('notifications.render.demand_refused_body', { name: data.actor_name || '', listing: data.listing_title || '' }),
      };
    case 'new_match':
      return {
        title: t('notifications.render.new_match_title'),
        body: t('notifications.render.new_match_body', { name: data.actor_name || '', score: data.score ?? 0 }),
      };
    case 'listing_match':
      return {
        title: t('notifications.render.listing_match_title'),
        body: t('notifications.render.listing_match_body', { listing: data.listing_title || '', city: data.city || '' }),
      };
    case 'subscription_expiring':
      return {
        title: t('notifications.render.subscription_expiring_title'),
        body: t('notifications.render.subscription_expiring_body', { count: data.days_left ?? 0 }),
      };
    case 'profile_incomplete':
      return {
        title: t('notifications.render.profile_incomplete_title'),
        body: t('notifications.render.profile_incomplete_body', { score: data.score ?? 0 }),
      };
    default:
      // Repli : anciennes notifications (texte figé en base, langue d'origine).
      return { title: notification.title, body: notification.content };
  }
}
