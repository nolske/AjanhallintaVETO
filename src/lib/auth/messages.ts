const errorMessages = {
  invalid_credentials: "Kirjautuminen ei onnistunut. Tarkista tiedot ja yrita uudelleen.",
  invalid_form: "Tarkista lomakkeen tiedot.",
  auth_callback: "Vahvistuslinkki ei ole voimassa tai se on jo kaytetty.",
  not_authenticated: "Kirjaudu sisaan jatkaaksesi.",
  update_failed: "Tallennus ei onnistunut. Yrita hetken kuluttua uudelleen.",
  reset_failed: "Salasanan vaihtaminen ei onnistunut. Pyydä uusi linkki tarvittaessa.",
  project_invalid: "Tarkista projektin tiedot.",
  project_not_allowed: "Sinulla ei ole oikeutta muokata tata projektia.",
  profile_setup_failed: "Kayttajaprofiilin valmistelu ei onnistunut.",
  project_save_failed: "Projektin tallennus ei onnistunut.",
  member_invalid: "Tarkista jasenen tiedot.",
  member_add_failed: "Jasenta ei voitu lisata. Tarkista osoite ja oikeutesi.",
  member_remove_failed: "Jasenta ei voitu poistaa.",
  owner_remove_blocked: "Projektin omistajaa ei voi poistaa jasenista.",
  time_entry_invalid: "Tarkista tuntikirjauksen tiedot.",
  time_entry_save_failed: "Tuntikirjauksen tallennus ei onnistunut.",
  time_entry_delete_failed: "Tuntikirjauksen poistaminen ei onnistunut.",
  unexpected: "Tapahtui odottamaton virhe. Yrita uudelleen."
} as const;

const statusMessages = {
  registration_check_email: "Tili luotiin. Tarkista sahkopostisi ja vahvista osoitteesi.",
  reset_email_sent: "Jos sahkoposti loytyy, saat linkin salasanan vaihtoon.",
  password_updated: "Salasana vaihdettiin. Voit nyt kirjautua sisaan.",
  signed_out: "Olet kirjautunut ulos.",
  profile_updated: "Profiili paivitettiin.",
  project_created: "Projekti luotiin.",
  project_updated: "Projekti paivitettiin.",
  project_archived: "Projekti arkistoitiin.",
  project_restored: "Projekti palautettiin aktiiviseksi.",
  member_added: "Jasen lisattiin projektiin.",
  member_already_exists: "Kayttaja on jo projektin jasen.",
  member_removed: "Jasen poistettiin projektista.",
  time_entry_created: "Tuntikirjaus lisattiin.",
  time_entry_updated: "Tuntikirjaus paivitettiin.",
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
