import React, { createContext, useContext, useEffect, useState } from 'react';

type LanguageCode = 'en' | 'de' | 'fr';

type Translations = Record<string, string>;

const translationMap: Record<LanguageCode, Translations> = {
  en: {
    nav_dashboard: 'Dashboard',
    nav_subscriptions: 'Subscriptions',
    nav_billing: 'Billing',
    nav_bank_sync: 'Bank Sync',
    nav_settings: 'Settings',
    nav_logout: 'Logout',
    nav_login: 'Login',
    nav_register: 'Register',

    subscriptions_manage_title: 'Manage Subscriptions',
    subscriptions_add: 'Add Subscription',
    subscriptions_filter_category: 'Filter by Category',
    subscriptions_filter_status: 'Filter by Status',
    subscriptions_none_title: 'No Subscriptions Found',
    subscriptions_none_desc_first: 'Start by adding your first subscription',
    subscriptions_none_desc_filter: 'Try adjusting your filters',
    subscriptions_delete_confirm_title: 'Confirm Delete',
    subscriptions_delete_confirm_body: 'Are you sure you want to delete this subscription? This action cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    subscriptions_error_load: 'Failed to load subscriptions',

    settings_title: 'Settings',
    settings_tab_notifications: 'Notifications',
    settings_tab_language: 'Language',
    settings_email_title: 'Email Notifications',
    settings_email_help: 'Get reminded before your subscription payments are due.',
    settings_no_email: 'No email set. Please logout and login again to set your email for notifications.',
    settings_reminder_timing: 'Reminder Timing',
    settings_custom_days: 'Or enter custom days:',
    settings_info_prefix: "You'll receive an email",
    settings_save_notifications: 'Save notification settings',
    settings_send_test: 'Send test notification',
    settings_language_label: 'Select your language',
    settings_language_save: 'Save language',
    settings_language_note: 'Language is stored locally for now.',

    subscriptions_all_categories: 'All Categories',
    subscriptions_all_status: 'All Status',
    status_active: 'Active',
    status_inactive: 'Inactive',
    status_cancelled: 'Cancelled',

    dashboard_title: 'Dashboard',
    dashboard_banner: 'Keep manual entry free. Upgrade for Pro checkout; bank sync via Stripe is coming.',
    dashboard_monthly_cost: 'Monthly Cost',
    dashboard_yearly_cost: 'Yearly Cost',
    dashboard_active: 'Active',
    dashboard_total_subs: 'Total Subscriptions',
    dashboard_chart_spending_history: 'Monthly Spending History',
    dashboard_chart_by_cost: 'Subscriptions by Cost',
    dashboard_chart_by_category: 'By Category',
    dashboard_chart_monthly_yearly: 'Monthly vs Yearly',
    dashboard_line_label: 'Monthly Spending (€)',
    dashboard_bar_label: 'Total Amount (€)',
    dashboard_label_monthly: 'Monthly',
    dashboard_label_yearly: 'Yearly',
    dashboard_no_data_title: 'No Data to Display',
    dashboard_no_data_desc: 'Add subscriptions to see charts and analytics of your spending',
    dashboard_your_subscriptions: 'Your Subscriptions',
    dashboard_no_subs_title: 'No Subscriptions Yet',
    dashboard_no_subs_desc: 'Start tracking your subscriptions to see your spending overview',
    dashboard_add_first_sub: 'Add Your First Subscription',
    dashboard_next_payment: 'Next payment',
  },
  de: {
    nav_dashboard: 'Übersicht',
    nav_subscriptions: 'Abos',
    nav_billing: 'Abrechnung',
    nav_bank_sync: 'Bank-Sync',
    nav_settings: 'Einstellungen',
    nav_logout: 'Abmelden',
    nav_login: 'Anmelden',
    nav_register: 'Registrieren',

    subscriptions_manage_title: 'Abonnements verwalten',
    subscriptions_add: 'Abo hinzufügen',
    subscriptions_filter_category: 'Nach Kategorie filtern',
    subscriptions_filter_status: 'Nach Status filtern',
    subscriptions_none_title: 'Keine Abos gefunden',
    subscriptions_none_desc_first: 'Füge dein erstes Abo hinzu',
    subscriptions_none_desc_filter: 'Passe deine Filter an',
    subscriptions_delete_confirm_title: 'Löschen bestätigen',
    subscriptions_delete_confirm_body: 'Möchtest du dieses Abo wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    subscriptions_error_load: 'Abos konnten nicht geladen werden',

    settings_title: 'Einstellungen',
    settings_tab_notifications: 'Benachrichtigungen',
    settings_tab_language: 'Sprache',
    settings_email_title: 'E-Mail-Benachrichtigungen',
    settings_email_help: 'Erhalte Erinnerungen vor fälligen Abo-Zahlungen.',
    settings_no_email: 'Keine E-Mail gesetzt. Bitte ab- und wieder anmelden, um die E-Mail zu speichern.',
    settings_reminder_timing: 'Erinnerungszeitpunkt',
    settings_custom_days: 'Oder individuelle Tage eingeben:',
    settings_info_prefix: 'Du erhältst eine E-Mail',
    settings_save_notifications: 'Benachrichtigungen speichern',
    settings_send_test: 'Testbenachrichtigung senden',
    settings_language_label: 'Wähle deine Sprache',
    settings_language_save: 'Sprache speichern',
    settings_language_note: 'Die Sprache wird derzeit lokal gespeichert.',

    subscriptions_all_categories: 'Alle Kategorien',
    subscriptions_all_status: 'Alle Status',
    status_active: 'Aktiv',
    status_inactive: 'Inaktiv',
    status_cancelled: 'Gekündigt',

    dashboard_title: 'Übersicht',
    dashboard_banner: 'Manuelle Eingaben bleiben kostenlos. Upgrade für Pro-Checkout; Bank-Sync über Stripe folgt.',
    dashboard_monthly_cost: 'Monatliche Kosten',
    dashboard_yearly_cost: 'Jährliche Kosten',
    dashboard_active: 'Aktiv',
    dashboard_total_subs: 'Abos gesamt',
    dashboard_chart_spending_history: 'Monatliche Ausgabenhistorie',
    dashboard_chart_by_cost: 'Abos nach Kosten',
    dashboard_chart_by_category: 'Nach Kategorie',
    dashboard_chart_monthly_yearly: 'Monatlich vs. Jährlich',
    dashboard_line_label: 'Monatliche Ausgaben (€)',
    dashboard_bar_label: 'Gesamtbetrag (€)',
    dashboard_label_monthly: 'Monatlich',
    dashboard_label_yearly: 'Jährlich',
    dashboard_no_data_title: 'Keine Daten',
    dashboard_no_data_desc: 'Füge Abos hinzu, um Diagramme und Analysen zu sehen',
    dashboard_your_subscriptions: 'Deine Abos',
    dashboard_no_subs_title: 'Noch keine Abos',
    dashboard_no_subs_desc: 'Beginne mit dem Tracking, um deine Ausgaben zu sehen',
    dashboard_add_first_sub: 'Erstes Abo hinzufügen',
    dashboard_next_payment: 'Nächste Zahlung',
  },
  fr: {
    nav_dashboard: 'Tableau de bord',
    nav_subscriptions: 'Abonnements',
    nav_billing: 'Facturation',
    nav_bank_sync: 'Sync banque',
    nav_settings: 'Paramètres',
    nav_logout: 'Déconnexion',
    nav_login: 'Connexion',
    nav_register: 'Inscription',

    subscriptions_manage_title: 'Gérer les abonnements',
    subscriptions_add: 'Ajouter un abonnement',
    subscriptions_filter_category: 'Filtrer par catégorie',
    subscriptions_filter_status: 'Filtrer par statut',
    subscriptions_none_title: 'Aucun abonnement trouvé',
    subscriptions_none_desc_first: 'Ajoutez votre premier abonnement',
    subscriptions_none_desc_filter: 'Essayez de modifier vos filtres',
    subscriptions_delete_confirm_title: 'Confirmer la suppression',
    subscriptions_delete_confirm_body: 'Supprimer cet abonnement ? Cette action est irréversible.',
    cancel: 'Annuler',
    delete: 'Supprimer',
    subscriptions_error_load: 'Échec du chargement des abonnements',

    settings_title: 'Paramètres',
    settings_tab_notifications: 'Notifications',
    settings_tab_language: 'Langue',
    settings_email_title: 'Notifications email',
    settings_email_help: 'Recevez un rappel avant les paiements de vos abonnements.',
    settings_no_email: "Aucun email défini. Déconnectez-vous puis reconnectez-vous pour l'enregistrer.",
    settings_reminder_timing: "Moment de l'alerte",
    settings_custom_days: 'Ou saisissez un nombre de jours :',
    settings_info_prefix: 'Vous recevrez un email',
    settings_save_notifications: 'Enregistrer les notifications',
    settings_send_test: 'Envoyer un test',
    settings_language_label: 'Choisissez votre langue',
    settings_language_save: 'Enregistrer la langue',
    settings_language_note: 'La langue est pour l’instant stockée localement.',

    subscriptions_all_categories: 'Toutes les catégories',
    subscriptions_all_status: 'Tous les statuts',
    status_active: 'Actif',
    status_inactive: 'Inactif',
    status_cancelled: 'Résilié',

    dashboard_title: 'Tableau de bord',
    dashboard_banner: 'Saisie manuelle gratuite. Passez en Pro pour le checkout ; synchronisation bancaire Stripe bientôt.',
    dashboard_monthly_cost: 'Coût mensuel',
    dashboard_yearly_cost: 'Coût annuel',
    dashboard_active: 'Actif',
    dashboard_total_subs: 'Abonnements au total',
    dashboard_chart_spending_history: 'Historique des dépenses mensuelles',
    dashboard_chart_by_cost: 'Abonnements par coût',
    dashboard_chart_by_category: 'Par catégorie',
    dashboard_chart_monthly_yearly: 'Mensuel vs Annuel',
    dashboard_line_label: 'Dépenses mensuelles (€)',
    dashboard_bar_label: 'Montant total (€)',
    dashboard_label_monthly: 'Mensuel',
    dashboard_label_yearly: 'Annuel',
    dashboard_no_data_title: 'Aucune donnée à afficher',
    dashboard_no_data_desc: 'Ajoutez des abonnements pour voir graphiques et analyses',
    dashboard_your_subscriptions: 'Vos abonnements',
    dashboard_no_subs_title: 'Aucun abonnement',
    dashboard_no_subs_desc: 'Commencez à suivre vos abonnements pour voir vos dépenses',
    dashboard_add_first_sub: 'Ajouter votre premier abonnement',
    dashboard_next_payment: 'Prochain paiement',
  },
};

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const stored = localStorage.getItem('language') as LanguageCode | null;
    return stored && ['en', 'de', 'fr'].includes(stored) ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    const translations = translationMap[language] || translationMap.en;
    return translations[key] || translationMap.en[key] || key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
