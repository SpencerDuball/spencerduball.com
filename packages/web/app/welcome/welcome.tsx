import { css } from "styled-system/css";
import { Button } from "~/components/ui/button";

export const Welcome = () => {
  return (
    <div className={css({ width: "full", bg: "slate.3", height: "full" })}>
      <Button colorPalette="bronze" variant="subtle">
        Hello
      </Button>
    </div>
  );
};
