"use client";

import type { NavigationItem } from "@/types";

import {
  useState,
  useRef,
  useEffect,
  useContext,
  forwardRef,
  createContext,
  PropsWithChildren,
} from "react";

import Link from "next/link";

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from "@floating-ui/react";

import { ChevronRightIcon } from "@heroicons/react/24/solid";

import { menuItemClasses } from "./MenuItem";

const MenuContext = createContext<{
  getItemProps: (
    userProps?: React.HTMLProps<HTMLElement>
  ) => Record<string, unknown>;
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setHasFocusInside: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}>({
  getItemProps: () => ({}),
  activeIndex: null,
  setActiveIndex: () => {},
  setHasFocusInside: () => {},
  isOpen: false,
});

/**
 * Main mega menu component
 */
type MegaMenuComponentProps = {
  page: NavigationItem;
};
const MegaMenuComponent = forwardRef<
  HTMLElement,
  PropsWithChildren<MegaMenuComponentProps>
>(function MenuComponent({ page, children, ...props }, ref) {
  const { title } = page;

  const [isOpen, setIsOpen] = useState(false);
  const [hasFocusInside, setHasFocusInside] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const elementsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const parent = useContext(MenuContext);

  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const item = useListItem();

  const isNested = parentId != null;

  const { floatingStyles, refs, context } = useFloating<HTMLButtonElement>({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: isNested ? "right-start" : "bottom-start",
    middleware: [
      offset({ mainAxis: isNested ? 0 : 4, alignmentAxis: isNested ? -4 : 0 }),
      flip(),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: isNested,
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });

  const click = useClick(context, {
    event: "mousedown",
    toggle: !isNested,
    ignoreMouse: isNested,
  });

  const role = useRole(context, { role: "menu" });

  const dismiss = useDismiss(context, { bubbles: true });

  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    nested: isNested,
    onNavigate: setActiveIndex,
  });

  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    onMatch: isOpen ? setActiveIndex : undefined,
    activeIndex,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [hover, click, role, dismiss, listNavigation, typeahead]
  );

  // Event emitter allows you to communicate across tree components.
  // This effect closes all menus when an item gets clicked anywhere
  // in the tree.
  useEffect(() => {
    if (!tree) return;

    function handleTreeClick() {
      setIsOpen(false);
    }

    function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
      if (event.nodeId !== nodeId && event.parentId === parentId) {
        setIsOpen(false);
      }
    }

    tree.events.on("click", handleTreeClick);
    tree.events.on("menuopen", onSubMenuOpen);

    return () => {
      tree.events.off("click", handleTreeClick);
      tree.events.off("menuopen", onSubMenuOpen);
    };
  }, [tree, nodeId, parentId]);

  useEffect(() => {
    if (isOpen && tree) {
      tree.events.emit("menuopen", { parentId, nodeId });
    }
  }, [tree, isOpen, nodeId, parentId]);

  return (
    <FloatingNode id={nodeId}>
      <Link
        href="/"
        ref={useMergeRefs([refs.setReference, item.ref, ref])}
        tabIndex={
          !isNested ? undefined : parent.activeIndex === item.index ? 0 : -1
        }
        role={isNested ? "menuitem" : undefined}
        data-open={isOpen ? "" : undefined}
        data-nested={isNested ? "" : undefined}
        data-focus-inside={hasFocusInside ? "" : undefined}
        className={isNested ? menuItemClasses : "text-black "}
        {...getReferenceProps(
          parent.getItemProps({
            ...props,
            onFocus(event: React.FocusEvent<HTMLButtonElement>) {
              // @ts-ignore
              props.onFocus?.(event);
              setHasFocusInside(false);
              parent.setHasFocusInside(true);
            },
          })
        )}
      >
        <div className="flex items-center gap-4">
          {title}
          {isNested && <ChevronRightIcon aria-hidden className="h-4 w-4 " />}
        </div>
      </Link>
      <MenuContext.Provider
        value={{
          activeIndex,
          setActiveIndex,
          getItemProps,
          setHasFocusInside,
          isOpen,
        }}
      >
        <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
          {isOpen && (
            <FloatingPortal>
              <FloatingFocusManager
                context={context}
                modal={false}
                initialFocus={isNested ? -1 : 0}
                returnFocus={!isNested}
              >
                <div
                  ref={refs.setFloating}
                  className="bg-white py-4 border-2 border-black w-32"
                  style={floatingStyles}
                  {...getFloatingProps()}
                >
                  <div className="flex flex-col space-y-2">{children}</div>
                </div>
              </FloatingFocusManager>
            </FloatingPortal>
          )}
        </FloatingList>
      </MenuContext.Provider>
    </FloatingNode>
  );
});

/**
 * Wrapper around the main component to render the
 *  <FloatingTree /> component if necessary.
 *
 * It will only render a floating tree when one does not already
 *  exist (i.e. it will render one for each L1 item)
 */
const MegaMenu = forwardRef<
  HTMLElement,
  PropsWithChildren<MegaMenuComponentProps>
>(function Menu(props, ref) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <MegaMenuComponent {...props} ref={ref} />
      </FloatingTree>
    );
  }

  return <MegaMenuComponent {...props} ref={ref} />;
});

export default MegaMenu;