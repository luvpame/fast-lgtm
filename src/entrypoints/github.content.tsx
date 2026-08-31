import { defineContentScript } from "#imports";
import { useState } from "react";
import { createRoot } from "react-dom/client";

import { prepareApprovalReview } from "../content/dom-adapter";
import { createReviewSurfaceController } from "../content/surface-controller";
import { reviewTemplate } from "../shared/storage";
import { prepareTemplate } from "../shared/template";

import "../styles/github.css";

const ROOT_ATTRIBUTE = "data-fast-lgtm-root";

type ReviewControlState = "idle" | "loading" | "error" | "success";

const REVIEW_ERROR_MESSAGES = {
  "review-button-not-found": "Fast LGTM could not find GitHub’s review control.",
  "review-body-not-found":
    "Fast LGTM could not find the review body. Continue in GitHub’s open review panel.",
  "review-body-update-failed":
    "Fast LGTM could not update the review body. Continue in GitHub’s open review panel.",
  "approve-option-not-found": "Approve is not available for this pull request.",
} as const;

export default defineContentScript({
  matches: ["https://github.com/*"],
  runAt: "document_idle",
  main(ctx) {
    function removeStaleRoots(): void {
      document.querySelectorAll<HTMLElement>(`[${ROOT_ATTRIBUTE}]`).forEach((root) => {
        root.remove();
      });
    }

    function mountControls(anchor: HTMLElement) {
      removeStaleRoots();

      const container = document.createElement("span");
      container.setAttribute(ROOT_ATTRIBUTE, "");
      anchor.before(container);

      const root = createRoot(container);
      root.render(<ReviewControls />);
      return {
        isConnected(): boolean {
          return container.isConnected;
        },
        unmount(): void {
          root.unmount();
          container.remove();
        },
      };
    }

    removeStaleRoots();
    const controller = createReviewSurfaceController({
      document,
      initialUrl: new URL(window.location.href),
      mount: mountControls,
    });

    ctx.addEventListener(window, "wxt:locationchange", (event) => {
      controller.syncUrl(event.newUrl);
    });

    ctx.onInvalidated(() => {
      controller.dispose();
    });
  },
});

function ReviewControls(): React.JSX.Element {
  const [state, setState] = useState<ReviewControlState>("idle");
  const [isAvailable, setIsAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePrepare(): Promise<void> {
    if (state === "loading") {
      return;
    }

    setState("loading");
    setErrorMessage("");

    try {
      const source = await reviewTemplate.getValue();
      const template = prepareTemplate(source);
      if (!template.ok) {
        setState("error");
        setErrorMessage("The saved template is invalid. Open Fast LGTM and save it again.");
        return;
      }

      const result = await prepareApprovalReview(document, {
        text: template.text,
        cursorOffset: template.cursorOffset,
      });

      if (!result.ok) {
        setState("error");
        setErrorMessage(REVIEW_ERROR_MESSAGES[result.error]);
        if (result.error === "approve-option-not-found") {
          setIsAvailable(false);
        }
        return;
      }
      setState("success");
    } catch {
      setState("error");
      setErrorMessage("Fast LGTM could not read your saved template. Try again.");
    }
  }

  function handleButtonClick(): void {
    void handlePrepare();
  }

  return (
    <span className="fast-lgtm-controls">
      {isAvailable ? (
        <button
          type="button"
          className="btn btn-primary fast-lgtm-button"
          disabled={state === "loading"}
          aria-disabled={state === "loading" ? "true" : "false"}
          aria-busy={state === "loading" ? "true" : "false"}
          data-state={state}
          onClick={handleButtonClick}
        >
          LGTM
        </button>
      ) : null}
      {errorMessage ? (
        <span className="fast-lgtm-alert" role="alert">
          {errorMessage}
        </span>
      ) : null}
    </span>
  );
}
