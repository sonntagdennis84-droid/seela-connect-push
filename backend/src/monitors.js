import crypto from "node:crypto";
import { extractText, extractTitle } from "./seelaClient.js";

export const monitors = [
  {
    id: "kanal1",
    title: "Kanal1",
    path: "/kanal1_nachrichten_list.php",
    notificationTitle: "Neue Seela-Nachricht"
  },
  {
    id: "stundenplan",
    title: "Kurs-Stundenplan",
    path: "/stundenplan2_list.php",
    notificationTitle: "Stundenplan geändert"
  },
  {
    id: "termine",
    title: "Kurstermine",
    path: "/_tn_termine_list.php",
    notificationTitle: "Kurstermine geändert"
  },
  {
    id: "fehlstunden",
    title: "Fehlstunden",
    path: "/_tn_fehlstunden_list.php",
    notificationTitle: "Fehlstunden aktualisiert"
  }
];

export function summarizePage(monitor, html) {
  const text = extractText(html);
  const title = extractTitle(html) || monitor.title;
  const relevantText = removeChromeText(text);
  return {
    monitorId: monitor.id,
    title,
    urlPath: monitor.path,
    fingerprint: sha256(relevantText),
    preview: relevantText.slice(0, 260)
  };
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function removeChromeText(text) {
  return text
    .replace(/Cookie-Hinweis .*? OK$/i, "")
    .replace(/Kanal1 Teilnehmermenü Hilfe & Support Impressum/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
