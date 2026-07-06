import { config } from "./config.js";
import { monitors, summarizePage } from "./monitors.js";
import { SeelaClient } from "./seelaClient.js";
import { readState, writeState } from "./store.js";
import { sendPush } from "./push.js";

export async function checkSeela() {
  const client = new SeelaClient();
  await client.login();

  const state = await readState();
  const changes = [];

  for (const monitor of monitors) {
    const html = await client.fetchPage(monitor.path);
    const summary = summarizePage(monitor, html);
    const previous = state[monitor.id];
    const changed = previous && previous.fingerprint !== summary.fingerprint;
    const isBaseline = !previous;

    state[monitor.id] = {
      ...summary,
      checkedAt: new Date().toISOString()
    };

    if (changed || (isBaseline && config.sendBaselinePush)) {
      changes.push({
        monitor,
        summary,
        reason: changed ? "changed" : "baseline"
      });
    }
  }

  await writeState(state);

  for (const change of changes) {
    await sendPush({
      title: change.monitor.notificationTitle,
      body: change.summary.preview || `${change.monitor.title} wurde aktualisiert.`,
      data: {
        monitorId: change.monitor.id,
        path: change.monitor.path,
        reason: change.reason
      }
    });
  }

  return {
    checkedAt: new Date().toISOString(),
    monitored: monitors.map((monitor) => monitor.id),
    changes: changes.map((change) => ({
      id: change.monitor.id,
      title: change.monitor.title,
      reason: change.reason,
      preview: change.summary.preview
    }))
  };
}
