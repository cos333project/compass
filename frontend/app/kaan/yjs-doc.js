import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";

export const ydoc = new Y.Doc();
export const webrtcProvider = new WebrtcProvider(
  "availabilities-management",
  ydoc
);

let persistenceProvider;
if (window === window.top) {
  persistenceProvider = new IndexeddbPersistence("availabilities", ydoc);
}

export { persistenceProvider };
