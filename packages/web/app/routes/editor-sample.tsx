import { Editor, EditorProvider, Toolbar } from "~/lib/ui/editor";

function EditorSample() {
  return (
    <main className="grid w-full justify-items-center">
      {/* For the height, we are subtracting `theme(spacing.40)` which is `Header` height + `Footer` height. */}
      <section className="grid h-[calc(100dvh-theme(spacing.40))] w-full max-w-5xl grid-rows-[max-content_1fr] justify-items-center gap-2 px-4 py-4">
        <Toolbar />
        <Editor className="h-full w-full" />
      </section>
    </main>
  );
}

export default function EditorSampleProvider() {
  return (
    <EditorProvider>
      <EditorSample />
    </EditorProvider>
  );
}
