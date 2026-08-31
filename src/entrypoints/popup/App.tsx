import { useEffect, useState, type FormEvent } from "react";

import { prepareTemplate } from "../../shared/template";
import { reviewTemplate } from "../../shared/storage";

type SaveState = "loading" | "idle" | "saving" | "validation-error" | "storage-error" | "success";

const TEMPLATE_ERROR_MESSAGES = {
  required: "Enter a template before saving.",
  "multiple-cursors": "Use at most one {{cursor}} marker.",
} as const;

function isErrorState(state: SaveState): boolean {
  return state === "validation-error" || state === "storage-error";
}

function getStatusMessage(state: SaveState, errorMessage: string): string {
  if (state === "loading") {
    return "Loading template…";
  }

  if (errorMessage) {
    return errorMessage;
  }

  return state === "success" ? "Saved." : "";
}

export default function App(): React.JSX.Element {
  const [value, setValue] = useState("");
  const [state, setState] = useState<SaveState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    void reviewTemplate
      .getValue()
      .then((savedTemplate) => {
        if (!active) {
          return;
        }

        setValue(savedTemplate);
        setState("idle");
      })
      .catch(() => {
        if (active) {
          setState("storage-error");
          setErrorMessage("Could not load your template.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setErrorMessage("");

    const preparedTemplate = prepareTemplate(value);
    if (!preparedTemplate.ok) {
      setState("validation-error");
      setErrorMessage(TEMPLATE_ERROR_MESSAGES[preparedTemplate.error]);
      return;
    }

    setState("saving");
    void reviewTemplate
      .setValue(value)
      .then(() => {
        setState("success");
      })
      .catch(() => {
        setState("storage-error");
        setErrorMessage("Could not save your template. Try again.");
      });
  }

  function handleChange(nextValue: string): void {
    setValue(nextValue);
    if (isErrorState(state) || state === "success") {
      setState("idle");
      setErrorMessage("");
    }
  }

  const isBusy = state === "loading" || state === "saving";
  const statusMessage = getStatusMessage(state, errorMessage);

  return (
    <main className="popup" aria-labelledby="popup-title">
      <header className="popup__header">
        <p className="popup__product">Fast LGTM</p>
        <h1 id="popup-title">Review template</h1>
        <p className="popup__description">Keep a short note ready for GitHub review.</p>
      </header>

      <form className="popup__form" onSubmit={handleSubmit}>
        <label className="popup__label" htmlFor="template">
          Template
        </label>
        <textarea
          id="template"
          name="template"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          disabled={state === "loading"}
          required
          aria-required="true"
          aria-invalid={state === "validation-error" ? "true" : "false"}
          aria-describedby="template-help template-status"
          data-state={state}
        />
        <p id="template-help" className="popup__help">
          Optional: add <code>{"{{cursor}}"}</code> where you want to continue writing.
        </p>
        <button
          type="submit"
          disabled={isBusy}
          aria-disabled={isBusy ? "true" : "false"}
          aria-busy={isBusy ? "true" : "false"}
          data-state={state === "saving" ? "loading" : state}
        >
          Save
        </button>
        <p
          id="template-status"
          className={`popup__status popup__status--${state}`}
          role={isErrorState(state) ? "alert" : "status"}
          aria-live="polite"
        >
          {statusMessage}
        </p>
      </form>
    </main>
  );
}
