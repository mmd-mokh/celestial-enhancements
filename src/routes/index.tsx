import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import gamioBody from "../gamio-body.html?raw";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "/gamio.js";
    s.defer = true;
    s.dataset.gamio = "1";
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

  return (
    <div
      className="tw-flex tw-min-h-[100vh] tw-flex-col tw-bg-white"
      dangerouslySetInnerHTML={{ __html: gamioBody }}
    />
  );
}
