const errorMessages = {
  invalid_credentials: "Kirjautuminen ei onnistunut. Tarkista tiedot ja yrita uudelleen.",
  invalid_form: "Tarkista lomakkeen tiedot.",
  auth_callback: "Vahvistuslinkki ei ole voimassa tai se on jo kaytetty.",
  not_authenticated: "Kirjaudu sisaan jatkaaksesi.",
  update_failed: "Tallennus ei onnistunut. Yrita hetken kuluttua uudelleen.",
  reset_failed: "Salasanan vaihtaminen ei onnistunut. Pyydä uusi linkki tarvittaessa.",
  unexpected: "Tapahtui odottamaton virhe. Yrita uudelleen."
} as const;

const statusMessages = {
  registration_check_email: "Tili luotiin. Tarkista sahkopostisi ja vahvista osoitteesi.",
  reset_email_sent: "Jos sahkoposti loytyy, saat linkin salasanan vaihtoon.",
  password_updated: "Salasana vaihdettiin. Voit nyt kirjautua sisaan.",
  signed_out: "Olet kirjautunut ulos.",
  profile_updated: "Profiili paivitettiin."
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
