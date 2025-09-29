# sosialhjelp-avtaler-admin

Adminpanel til støtte for avtaleløsningen ([sosialhjelp-avtaler](https://github.com/navikt/sosialhjelp-avtaler) og [sosialhjelp-avtaler-api](https://github.com/navikt/sosialhjelp-avtaler-api)), der kommunene signerer databehandleravtaler med Nav. I adminpanelet kan avtalemaler lages og publiseres.

## Komme i gang

For å kjøre appen lokalt, må backend kjøre (sosialhjelp-avtaler-api).

Variabel som må legges til i env.local:
`NEXT_AVTALER_API_HOSTNAME="localhost"`

Sosialhjelp-avtaler-admin er et Next-project som bruker npm. For å bygge og kjøre prosjektet gjør man følgende:

```
npm install
npm run dev
```

Gå til `localhost:3008/sosialhjelp/admin-avtaler`

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen [#team_digisos](https://app.slack.com/client/T5LNAMWNA/C6LDFTJP2)
