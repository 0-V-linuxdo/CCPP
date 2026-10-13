import { GlobalRegistrator } from "@happy-dom/global-registrator";
import * as PropertySymbol from "happy-dom/lib/PropertySymbol.js";
import Node from "happy-dom/lib/nodes/node/Node.js";

GlobalRegistrator.register({ url: "https://claude.ai/new" });

// happy-dom holds each MutationObserver's callback only through a WeakRef, so a garbage collection
// mid-suite silently stops observers that are still connected. Keep the callback alive with its listener.
const observe = Node.prototype[PropertySymbol.observeMutations];
Node.prototype[PropertySymbol.observeMutations] = function (listener: any) {
    listener.strong ??= listener.callback.deref();
    return observe.call(this, listener);
};
