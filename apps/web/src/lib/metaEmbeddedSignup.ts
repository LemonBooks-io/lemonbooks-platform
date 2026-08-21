type SignupResult = { code: string; wabaId: string; phoneNumberId: string };

declare global {
  interface Window {
    FB?: {
      init(options: Record<string, unknown>): void;
      login(callback: (response: { authResponse?: { code?: string } }) => void, options: Record<string, unknown>): void;
    };
  }
}

let sdkPromise: Promise<void> | undefined;
function loadSdk(appId: string, graphVersion: string) {
  if (window.FB) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("facebook-jssdk");
    window.addEventListener("fb-sdk-ready", () => resolve(), { once: true });
    if (existing) return;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Could not load Meta signup"));
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, autoLogAppEvents: true, xfbml: true, version: graphVersion });
      window.dispatchEvent(new Event("fb-sdk-ready"));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

declare global { interface Window { fbAsyncInit?: () => void } }

export async function launchMetaEmbeddedSignup(input: { appId: string; configId: string; graphVersion: string }): Promise<SignupResult> {
  await loadSdk(input.appId, input.graphVersion);
  return new Promise((resolve, reject) => {
    let assets: { wabaId?: string; phoneNumberId?: string } = {};
    let authorizationCode = "";
    const timeout = window.setTimeout(() => finish(new Error("Meta signup timed out")), 10 * 60 * 1000);
    const listener = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      let payload: unknown = event.data;
      try { if (typeof payload === "string") payload = JSON.parse(payload); } catch { return; }
      const message = payload as { type?: string; event?: string; data?: { waba_id?: string; phone_number_id?: string } };
      if (message.type !== "WA_EMBEDDED_SIGNUP") return;
      if (message.event === "FINISH") { assets = { wabaId: message.data?.waba_id, phoneNumberId: message.data?.phone_number_id }; maybeComplete(); }
      if (message.event === "CANCEL" || message.event === "ERROR") finish(new Error(`Meta signup ${message.event.toLowerCase()}`));
    };
    window.addEventListener("message", listener);
    function finish(error?: Error, result?: SignupResult) {
      window.clearTimeout(timeout); window.removeEventListener("message", listener);
      if (error) reject(error); else if (result) resolve(result);
    }
    function maybeComplete() {
      if (authorizationCode && assets.wabaId && assets.phoneNumberId) finish(undefined, { code: authorizationCode, wabaId: assets.wabaId, phoneNumberId: assets.phoneNumberId });
    }
    window.FB!.login((response) => {
      const code = response.authResponse?.code;
      if (!code) return finish(new Error("Meta did not return an authorization code"));
      authorizationCode = code;
      maybeComplete();
    }, { config_id: input.configId, response_type: "code", override_default_response_type: true, extras: { setup: {}, featureType: "", sessionInfoVersion: "3" } });
  });
}
