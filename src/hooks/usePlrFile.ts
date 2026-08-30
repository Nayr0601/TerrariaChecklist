import { useCallback, useState } from "react";
import { parsePlrFile } from "../parser/plrParser";
import { resolveResearchState } from "../parser/resolveResearch";
import { itemCatalog } from "../data/itemCatalog";
import type { ItemResearchState, PlayerHeader } from "../parser/types";

export type PlrLoadState =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "error"; message: string }
  | { status: "not-journey"; header: PlayerHeader; message: string }
  | { status: "ready"; header: PlayerHeader; research: Record<string, ItemResearchState>; fileName: string };

/**
 * Owns the `.plr` load lifecycle: reads the File into memory, runs it
 * through the parser (client-side only — see parser/plrParser.ts), and
 * resolves the result against the item catalog. The raw file bytes and
 * decrypted plaintext are local variables inside `loadFile` and are never
 * stored in React state or sent anywhere; only the small derived
 * research-status map is kept.
 */
export function usePlrFile() {
  const [state, setState] = useState<PlrLoadState>({ status: "idle" });

  const loadFile = useCallback(async (file: File) => {
    setState({ status: "loading", fileName: file.name });
    try {
      const buffer = await file.arrayBuffer();
      const result = await parsePlrFile(buffer);

      if (!result.ok) {
        if (result.kind === "not-journey") {
          setState({ status: "not-journey", header: result.header, message: result.message });
        } else {
          setState({ status: "error", message: result.message });
        }
        return;
      }

      const research = resolveResearchState(result.research, itemCatalog);
      setState({ status: "ready", header: result.header, research, fileName: file.name });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong while reading that file.",
      });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, loadFile, reset };
}
