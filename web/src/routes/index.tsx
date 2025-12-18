import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePrefsDispatch } from "@/components/ctx/preferences/context";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const dispatch = usePrefsDispatch();

  return (
    <div className="App">
      <header className="App-header">
        <p className="bg-amber-800 text-red-50">
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
        <a className="App-link" href="https://tanstack.com" target="_blank" rel="noopener noreferrer">
          Learn TanStack
        </a>
      </header>
      <Button onClick={() => dispatch({ type: "theme.app.toggle" })}>Hello</Button>
    </div>
  );
}
