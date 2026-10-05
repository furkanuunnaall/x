import React, { useRef } from "react";
import { Keyboard, Platform, StyleSheet, TextInput } from "react-native";

const turkishLetter = /^[A-ZÇĞİÖŞÜ]$/;
const maxBuffer = 24;

export function showKeyboard(input: TextInput | null) {
  if (!input) return;
  if (input.isFocused() && Keyboard.isVisible()) return;
  if (!input.isFocused()) input.focus();
  // The web has no keyboard events to check against; a focused field is enough there.
  if (Platform.OS === "web") return;
  // A focused input whose keyboard was dismissed (Android back, a modal, the app going to the
  // background) ignores focus(). iOS also drops a focus() that lands while the keyboard is
  // still sliding away, so check again a moment later and force a clean refocus if needed.
  setTimeout(() => {
    if (input.isFocused() && Keyboard.isVisible()) return;
    input.blur();
    setTimeout(() => input.focus(), 50);
  }, 250);
}

export function NativeLetterInput({
  ref,
  onLetters,
  onDelete,
  onSubmit,
  editable = true,
}: {
  ref: React.Ref<TextInput>;
  onLetters: (letters: string[]) => void;
  onDelete: () => void;
  onSubmit: () => void;
  editable?: boolean;
}) {
  const input = useRef<TextInput | null>(null);
  // What the native field currently holds. The field is left uncontrolled: forcing it back
  // to "" on every keystroke races with fast typing and drops or repeats letters.
  const buffer = useRef("");
  const setRef = (node: TextInput | null) => {
    input.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.RefObject<TextInput | null>).current = node;
  };
  return (
    <TextInput
      ref={setRef}
      defaultValue=""
      editable={editable}
      onChangeText={(text) => {
        const added = text.length - buffer.current.length;
        buffer.current = text;
        if (text.length > maxBuffer) {
          input.current?.clear();
          buffer.current = "";
        }
        // Deletions arrive through onKeyPress, so only growth matters here.
        if (added <= 0) return;
        // "tr" locale maps i→İ and ı→I, which the default toUpperCase gets wrong.
        const letters = Array.from(
          text.slice(-added).toLocaleUpperCase("tr"),
        ).filter((c) => turkishLetter.test(c));
        if (letters.length) onLetters(letters);
      }}
      onKeyPress={({ nativeEvent }) => {
        if (nativeEvent.key === "Backspace") onDelete();
      }}
      onSubmitEditing={onSubmit}
      submitBehavior="submit"
      // react-native-web ignores submitBehavior and blurs on Enter unless this is set.
      blurOnSubmit={false}
      autoCapitalize="characters"
      autoCorrect={false}
      autoComplete="off"
      spellCheck={false}
      caretHidden
      returnKeyType="done"
      accessibilityLabel="Harf gir"
      style={styles.hidden}
    />
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    left: 0,
    top: 0,
  },
});
