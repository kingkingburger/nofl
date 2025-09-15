/*! coi-serviceworker v0.1.7 - Guido Zuidhof and contributors, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

    self.addEventListener("message", (event) => {
        if (event.data && event.data.type === "COEP_CREDENTIALLESS") {
            coepCredentialless = event.data.value;
        }
    });

    self.addEventListener("fetch", function (event) {
        const r = event.request;
        if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
            return;
        }

        const request = (coepCredentialless && r.mode === "no-cors")
            ? new Request(r, {
                credentials: "omit",
            })
            : r;
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.status === 0) {
                        return response;
                    }

                    const newHeaders = new Headers(response.headers);
                    newHeaders.set("Cross-Origin-Embedder-Policy",
                        coepCredentialless ? "credentialless" : "require-corp"
                    );
                    if (!crossOriginIsolated) {
                        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                    }

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    });
                })
                .catch((e) => console.error(e))
        );
    });
} else {
    (() => {
        const reloadedBySelf = window.sessionStorage.getItem("coiReloadedBySelf");
        window.sessionStorage.removeItem("coiReloadedBySelf");
        const coepDegradeCredentialless = !window.crossOriginIsolated && window.location.protocol === "https:";
        coepCredentialless = coepDegradeCredentialless || window.crossOriginIsolated;

        if (!window.crossOriginIsolated && !reloadedBySelf && window.location.protocol !== "file:") {
            window.sessionStorage.setItem("coiReloadedBySelf", "true");
            window.location.reload();
        }

        if (coepCredentialless) {
            navigator.serviceWorker.register(window.document.currentScript.src).then(
                (registration) => {
                    registration.addEventListener("updatefound", () => {
                        registration.installing.addEventListener("statechange", () => {
                            if (registration.installing.state === "activated") {
                                window.location.reload();
                            }
                        });
                    });

                    const messageChannel = new MessageChannel();
                    messageChannel.port1.onmessage = (event) => {
                        if (event.data.type === "COEP_CREDENTIALLESS_SUPPORTED") {
                            if (registration.active && !window.crossOriginIsolated) {
                                registration.active.postMessage({
                                    type: "COEP_CREDENTIALLESS",
                                    value: true,
                                });
                            }
                        }
                    };
                    registration.active?.postMessage({ type: "COEP_CREDENTIALLESS_SUPPORT" }, [messageChannel.port2]);
                }, (err) => console.error("coi: registration failed", err)
            );
        }
    })();
}
