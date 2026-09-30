/** Writes docs/05-inventaire-medias.md from the asset mapping and manifests. */
import fs from "node:fs";
import path from "node:path";
import { mediaInventory } from "../../data/media-inventory.ts";
import { selection } from "./selection.ts";

const root = path.resolve(import.meta.dirname, "../..");
const ext = JSON.parse(fs.readFileSync(path.join(root, "data/generated/external-media.json"), "utf8"));
const slugOf = new Map(selection.map((s) => [s.file, s.slug]));
const cities = { moscou: "Moscou", "nijni-novgorod": "Nijni Novgorod", trajet: "Trajets" } as const;
const statusLabel = { retenu: "**retenu**", reserve: "réserve", ecarte: "écarté", prive: "**privé**" } as const;
const count = (f: (e: (typeof mediaInventory)[number]) => boolean) => mediaInventory.filter(f).length;

let md = `# Inventaire des médias du fondateur

*Généré par \`node scripts/media/inventory-doc.ts\` à partir de \`data/media-inventory.ts\`. Dernière analyse : 30/09/2026.*

Dossier Drive du voyage du 19 au 26/09/2026 (iPhone 15). Chaque fichier a été ouvert et identifié visuellement : les positions GPS des photos sont décalées jusqu'à ~1 km et ne servent jamais à nommer un lieu. Aucune coordonnée ni identifiant Drive n'est publié.

| | Total | Retenus (traités) | Réserve | Écartés | Privés |
|---|---|---|---|---|---|
| Fichiers | ${mediaInventory.length} | ${count((e) => e.status === "retenu")} | ${count((e) => e.status === "reserve")} | ${count((e) => e.status === "ecarte")} | ${count((e) => e.status === "prive")} |

- **Qualité** : A excellent · B bon · C utilisable avec réserve · D inutilisable.
- **Personnes** : \`consentement\` = autorisation écrite confirmée ; \`a-flouter\` = visages identifiables, ne pas publier en l'état.
- **Nom publié** : nom du fichier traité dans \`public/media/verste/\` (métadonnées supprimées, contrôlé par \`npm run media:check\`).

`;

for (const [city, label] of Object.entries(cities)) {
  const rows = mediaInventory.filter((e) => e.city === city);
  md += `## ${label} · ${rows.length} fichiers\n\n| Fichier | Date | Lieu | Type | Orient. | Qualité | Statut | Usage | Nom publié |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const e of rows) {
    const type = e.type === "video" ? `vidéo ${e.durationS ?? "?"} s` : e.type;
    const people = e.people === "consentement" ? " · consentement" : e.people === "a-flouter" ? " · visages à flouter" : "";
    const note = e.note ? ` *(${e.note})*` : "";
    md += `| ${e.file} | ${e.takenAt?.replace("T", " ") ?? "—"} | ${e.place}${note} | ${type} | ${e.orientation} | ${e.quality} | ${statusLabel[e.status]}${people} | ${e.use} | ${slugOf.get(e.file) ?? "—"} |\n`;
  }
  md += "\n";
}

md += `## Médias externes (niveau 2)

Utilisés uniquement là où aucun média personnel n'existe. Tous proviennent de Wikimedia Commons, sous licence libre vérifiée sur la page d'origine le 30/09/2026 ; ils portent \`kind: "illustrative"\` et leur crédit s'affiche à côté de l'image.

| Nom publié | Auteur | Licence | Source |
|---|---|---|---|
`;
for (const [slug, f] of Object.entries(ext) as Array<[string, { author: string; license: string; source: string }]>) {
  md += `| ${slug} | ${f.author} | ${f.license} | [page Commons](${f.source}) |\n`;
}
md += `
## Placeholders (niveau 3)

Aucune image libre satisfaisante trouvée : un placeholder identifié (« Image à venir ») est affiché plutôt qu'une image aux droits incertains.

- **Séance de lutte** : les photos libres trouvées montrent des compétitions avec des personnes identifiables, hors contexte.
- **Lacs de Chtcholokovski Khoutor en été, plage** : vos vidéos d'automne suffisent pour l'instant.
`;
fs.writeFileSync(path.join(root, "docs/05-inventaire-medias.md"), md);
console.log("docs/05-inventaire-medias.md écrit");
