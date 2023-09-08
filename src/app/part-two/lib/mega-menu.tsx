import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

import { createContext, useMemo, useState } from "react";
import { detectOverflow, size, type Middleware } from "@floating-ui/react";

/**
 * Context for managing heights of dropdowns
 */
type IHeightContext = {
  height: [string, number][];
  setHeight: Dispatch<SetStateAction<IHeightContext["height"]>>;
};

export const HeightContext = createContext<IHeightContext>({
  height: [],
  setHeight: () => {},
});

export function HeightContextProvider({ children }: PropsWithChildren) {
  const [height, setHeight] = useState<IHeightContext["height"]>([]);

  const value = useMemo(() => ({ height, setHeight }), [height, setHeight]);

  return (
    <HeightContext.Provider value={value}>{children}</HeightContext.Provider>
  );
}

/**
 * Middleware
 */
export function handleOverflow(): Middleware {
  return {
    name: "handleOverflow",
    async fn(state) {
      // https://floating-ui.com/docs/detectoverflow
      const { right, bottom } = await detectOverflow(state, {
        rootBoundary: "viewport",
      });

      const {
        elements: { floating },
      } = state;

      /**
       * Check if this floating element is off screen
       * If so, hide it and return immediately
       */
      if (right > 0) {
        floating.style.display = "none";

        // return custom property to tell other middleware that a dropdown
        //  is being hidden
        return {
          data: { isHidingChild: true },
        };
      }

      /**
       * Check if this floating element has room for a child of its own
       * If it does not, we want to hide all chevron icons for menu items
       *  that have children
       */

      // viewport inner width
      const { innerWidth } = window;

      // bounding box of the floating element
      const { x, width } = floating.getBoundingClientRect();

      // x + width gets the x pos of the right border of this dropdown
      // multiply by 2 since all dropdowns are the same width
      const hasRoomForChild = x + width * 2 <= innerWidth;

      if (!hasRoomForChild) {
        const icons = floating.getElementsByTagName("svg");

        Array.from(icons).forEach((icon) => {
          icon.style.display = "none";
        });
      }

      return {};
    },
  };
}

export function handleHeight(
  nodeId: string,
  setHeight: IHeightContext["setHeight"]
): Middleware {
  return size({
    apply({ middlewareData, rects }) {
      const { floating } = rects;

      const maxHeightProperty = document.documentElement.style
        .getPropertyValue("--menu-max-height")
        .split("px")[0];
      const maxHeightPx =
        maxHeightProperty === "unset" ? 0 : Number.parseInt(maxHeightProperty);

      if (!maxHeightPx || maxHeightPx < floating.height) {
        const newHeight = floating.height;
        setHeight((old) => [...old, [nodeId, newHeight]]);
      }
    },
  });
}
