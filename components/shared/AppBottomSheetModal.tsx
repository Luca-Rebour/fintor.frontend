import { APP_COLORS } from "../../constants/colors";
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

type AppBottomSheetModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  snapPoints?: Array<string | number>;
  debugName?: string;
  stackBehavior?: "push" | "switch" | "replace";
}>;

function debugLog(_debugName: string, _message: string, _payload?: Record<string, unknown>) {
  return;
}

export function AppBottomSheetModal({
  visible,
  onClose,
  snapPoints,
  debugName = "unnamed",
  stackBehavior,
  children,
}: AppBottomSheetModalProps) {
  const modalRef = useRef<BottomSheetModal>(null);
  const isPresentedRef = useRef(false);

  const resolvedSnapPoints = useMemo<Array<string | number>>(
    () => (snapPoints?.length ? snapPoints : ["92%"]),
    [snapPoints],
  );

  useEffect(() => {
    debugLog(debugName, "visible changed", {
      visible,
      isPresented: isPresentedRef.current,
      hasRef: Boolean(modalRef.current),
      snapPoints: resolvedSnapPoints,
    });

    if (visible) {
      if (isPresentedRef.current) {
        debugLog(debugName, "skip present because already presented");
        return;
      }

      const frameId = requestAnimationFrame(() => {
        debugLog(debugName, "requestAnimationFrame present start", {
          hasRef: Boolean(modalRef.current),
        });
        isPresentedRef.current = true;
        modalRef.current?.present();
        debugLog(debugName, "present invoked", {
          isPresented: isPresentedRef.current,
        });
      });

      return () => {
        debugLog(debugName, "cancelAnimationFrame on cleanup while visible");
        cancelAnimationFrame(frameId);
      };
    }

    if (!isPresentedRef.current) {
      debugLog(debugName, "skip dismiss because not presented");
      return;
    }

    isPresentedRef.current = false;
    debugLog(debugName, "dismiss invoked", {
      hasRef: Boolean(modalRef.current),
    });
    modalRef.current?.dismiss();
  }, [debugName, resolvedSnapPoints, visible]);

  const handleDismiss = useCallback(() => {
    debugLog(debugName, "onDismiss callback fired", {
      isPresentedBefore: isPresentedRef.current,
    });

    if (!isPresentedRef.current) {
      debugLog(debugName, "onDismiss ignored because already not presented");
      return;
    }

    isPresentedRef.current = false;
    debugLog(debugName, "onDismiss propagates onClose");
    onClose();
  }, [debugName, onClose]);

  const handleChange = useCallback(
    (index: number) => {
      debugLog(debugName, "onChange index", { index });
    },
    [debugName],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={resolvedSnapPoints}
      stackBehavior={stackBehavior}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      onChange={handleChange}
      backgroundStyle={styles.sheetBackground}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      {children}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: APP_COLORS.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
  },
});

