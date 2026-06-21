export type GoogleCredentialResponse = {
  credential?: string;
};

export type GooglePromptNotification = {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
};

type GoogleCredentialHandler = (response: GoogleCredentialResponse) => void;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          prompt: (
            callback?: (notification: GooglePromptNotification) => void,
          ) => void;
        };
      };
    };
    __googleCredentialHandler?: GoogleCredentialHandler;
    __googleIdentityInitializedClientId?: string;
    __googleIdentityScriptPromise?: Promise<void>;
  }
}

const scriptId = "google-identity-script";

function initializeGoogleIdentity(clientId: string) {
  if (!window.google) {
    return;
  }

  if (window.__googleIdentityInitializedClientId === clientId) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      window.__googleCredentialHandler?.(response);
    },
  });

  window.__googleIdentityInitializedClientId = clientId;
}

export function loadGoogleIdentity(
  clientId: string,
  handler: GoogleCredentialHandler,
) {
  window.__googleCredentialHandler = handler;

  if (window.google) {
    initializeGoogleIdentity(clientId);
    return Promise.resolve();
  }

  if (window.__googleIdentityScriptPromise) {
    return window.__googleIdentityScriptPromise.then(() => {
      initializeGoogleIdentity(clientId);
    });
  }

  window.__googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          initializeGoogleIdentity(clientId);
          resolve();
        },
        { once: true },
      );
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleIdentity(clientId);
      resolve();
    };
    script.onerror = reject;

    document.body.appendChild(script);
  });

  return window.__googleIdentityScriptPromise;
}

export function promptGoogleIdentity(
  callback?: (notification: GooglePromptNotification) => void,
) {
  if (!window.google) {
    throw new Error("Google Identity Services is not loaded.");
  }

  window.google.accounts.id.prompt(callback);
}
