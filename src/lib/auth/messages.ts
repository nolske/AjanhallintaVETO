const errorMessages = {
  invalid_credentials: "Kirjautuminen ei onnistunut. Tarkista tiedot ja yritä uudelleen.",
  invalid_form: "Tarkista lomakkeen tiedot.",
  auth_callback: "Vahvistuslinkki ei ole voimassa tai se on jo käytetty.",
  not_authenticated: "Kirjaudu sisään jatkaaksesi.",
  update_failed: "Tallennus ei onnistunut. Yritä hetken kuluttua uudelleen.",
  reset_failed: "Salasanan vaihtaminen ei onnistunut. Pyydä uusi linkki tarvittaessa.",
  project_invalid: "Tarkista projektin tiedot.",
  project_not_allowed: "Sinulla ei ole oikeutta muokata tätä projektia.",
  profile_setup_failed: "Käyttäjäprofiilin valmistelu ei onnistunut.",
  project_save_failed: "Projektin tallennus ei onnistunut.",
  member_invalid: "Tarkista jäsenen tiedot.",
  member_add_failed: "Jäsentä ei voitu lisätä. Tarkista osoite ja oikeutesi.",
  member_remove_failed: "Jäsentä ei voitu poistaa.",
  owner_remove_blocked: "Projektin omistajaa ei voi poistaa jäsenistä.",
  time_entry_invalid: "Tarkista tuntikirjauksen tiedot.",
  time_entry_save_failed: "Tuntikirjauksen tallennus ei onnistunut.",
  time_entry_delete_failed: "Tuntikirjauksen poistaminen ei onnistunut.",
  too_many_requests: "Liian monta yritystä. Odota hetki ja yritä uudelleen.",
  unexpected: "Tapahtui odottamaton virhe. Yritä uudelleen."
} as const;

const statusMessages = {
  registration_check_email: "Tili luotiin. Tarkista sähköpostisi ja vahvista osoitteesi.",
  reset_email_sent: "Jos sähköposti löytyy, saat linkin salasanan vaihtoon.",
  password_updated: "Salasana vaihdettiin. Voit nyt kirjautua sisään.",
  signed_out: "Olet kirjautunut ulos.",
  profile_updated: "Profiili päivitettiin.",
  project_created: "Projekti luotiin.",
  project_updated: "Projekti päivitettiin.",
  project_archived: "Projekti arkistoitiin.",
  project_restored: "Projekti palautettiin aktiiviseksi.",
  member_added: "Jäsen lisättiin projektiin.",
  member_already_exists: "Käyttäjä on jo projektin jäsen.",
  member_removed: "Jäsen poistettiin projektista.",
  time_entry_created: "Tuntikirjaus lisättiin.",
  time_entry_updated: "Tuntikirjaus päivitettiin.",
  time_entry_deleted: "Tuntikirjaus poistettiin."
} as const;

export type ErrorCode = keyof typeof errorMessages;
export type StatusCode = keyof typeof statusMessages;

export function getAuthErrorMessage(code: string | string[] | undefined) {
  const key = Array.isArray(code) ? code[0] : code;
  if (!key || !(key in errorMessages)) {
    return null;
  }

  return errorMessages[key as ErrorCode];
}

export function getAuthStatusMessage(code: string | string[] | undefined) {
  const key = Array.isArray(code) ? code[0] : code;
  if (!key || !(key in statusMessages)) {
    return null;
  }

  return statusMessages[key as StatusCode];
}
