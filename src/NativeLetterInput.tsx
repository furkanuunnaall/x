import React, { useEffect, useRef } from "react";
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
  resetKey,
}: {
  ref: React.Ref<TextInput>;
  onLetters: (letters: string[]) => void;
  onDelete: () => void;
  onSubmit: () => void;
  editable?: boolean;
  /** Changing this empties the field (a word was checked or another word opened), so old
   * text never piles up towards the buffer limit. */
  resetKey?: string;
}) {
  const input = useRef<TextInput | null>(null);
  // What the native field currently holds. The field is left uncontrolled: forcing it back
  // to "" on every keystroke races with fast typing and drops or repeats letters.
  const buffer = useRef("");
  // Set when the field was asked to clear: iOS sometimes ignores clear() on an uncontrolled
  // field, and the old text then comes back with the next key.
  const cleared = useRef(false);
  // onKeyPress fires before onChangeText: a Backspace marks the next shrink as a deletion.
  const deleting = useRef(false);
  const clear = () => {
    input.current?.clear();
    cleared.current = true;
  };
  const first = useRef(true);
  useEffect(() => {
    if (first.current) first.current = false;
    else clear();
  }, [resetKey]);
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
        const before = buffer.current;
        const deletion = deleting.current && text.length < before.length;
        deleting.current = false;
        let fresh: string;
        if (deletion) {
          // A deletion never adds letters, even when an ignored clear() left old text behind.
          cleared.current = false;
          fresh = "";
        } else if (cleared.current) {
          cleared.current = false;
          // Clear worked: everything is new. Clear was ignored: only what follows the old text.
          fresh = text.startsWith(before) ? text.slice(before.length) : text;
        } else {
          // Deletions arrive through onKeyPress, so only growth matters here.
          fresh = text.length > before.length ? text.slice(before.length - text.length) : "";
        }
        buffer.current = text;
        if (text.length > maxBuffer) clear();
        // "tr" locale maps i→İ and ı→I, which the default toUpperCase gets wrong.
        const letters = Array.from(fresh.toLocaleUpperCase("tr")).filter((c) =>
          turkishLetter.test(c),
        );
        if (letters.length) onLetters(letters);
      }}
      onKeyPress={({ nativeEvent }) => {
        if (nativeEvent.key !== "Backspace") return;
        deleting.current = true;
        onDelete();
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
