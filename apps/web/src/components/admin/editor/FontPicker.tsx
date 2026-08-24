"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Combo, MenuHeading, MenuItem, keepFocus } from "./ui";
import { useAdminText } from "@/lib/admin-strings";
import {
  BUNDLED_FONTS,
  SYSTEM_BANGLA_FONTS,
  SYSTEM_LATIN_FONTS,
  canReadInstalledFonts,
  loadInstalledFonts,
  type FontOption,
} from "./fonts";

/**
 * Word's font picker.
 *
 * Word lists every font on the machine; a browser will only do that after the
 * user grants permission, so the machine's fonts load on request via the Local
 * Font Access API and then sit in their own section.
 *
 * The list is grouped by how safely a font survives publishing: fonts the site
 * itself ships reach every reader, while a font that merely happens to be
 * installed here falls back on a reader's device that lacks it. Saying that in
 * the menu is more useful than a flat alphabetical list that hides it.
 */
export function FontPicker({ editor }: { editor: Editor }) {
  const ax = useAdminText();
  const [installed, setInstalled] = useState<FontOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  const current = editor.getAttributes("textStyle").fontFamily as
    | string
    | undefined;

  const known = [
    ...BUNDLED_FONTS,
    ...SYSTEM_BANGLA_FONTS,
    ...SYSTEM_LATIN_FONTS,
    ...(installed ?? []),
  ];
  const active = known.find((f) => f.value === current);

  const loadFromMachine = async () => {
    setLoading(true);
    setDenied(false);
    const fonts = await loadInstalledFonts();
    if (fonts) setInstalled(fonts);
    else setDenied(true);
    setLoading(false);
  };

  const apply = (font: FontOption | null, close: () => void) => {
    if (font) editor.chain().focus().setFontFamily(font.value).run();
    else editor.chain().focus().unsetFontFamily().run();
    close();
  };

  const Section = ({
    heading,
    fonts,
    close,
  }: {
    heading: string;
    fonts: FontOption[];
    close: () => void;
  }) => (
    <>
      <MenuHeading>{heading}</MenuHeading>
      {fonts.map((font) => (
        <MenuItem
          key={`${font.tier}-${font.label}`}
          active={font.value === current}
          style={{ fontFamily: font.value, fontSize: "13px" }}
          onClick={() => apply(font, close)}
        >
          {font.label}
        </MenuItem>
      ))}
    </>
  );

  return (
    <Combo
      label={active?.label ?? "Default"}
      width="w-40"
      panelWidth={260}
      title={ax("ফন্ট")}
    >
      {(close) => (
        <>
          <MenuItem active={!current} onClick={() => apply(null, close)}>
            {ax("Default (সাইটের ফন্ট)")}
          </MenuItem>

          <Section
            heading={ax("সাইটের নিজের ফন্ট — সব পাঠক দেখবে")}
            fonts={BUNDLED_FONTS}
            close={close}
          />
          <Section
            heading={ax("বাংলা — পাঠকের কম্পিউটারে থাকলে দেখাবে")}
            fonts={SYSTEM_BANGLA_FONTS}
            close={close}
          />
          <Section
            heading={ax("ইংরেজি — পাঠকের কম্পিউটারে থাকলে দেখাবে")}
            fonts={SYSTEM_LATIN_FONTS}
            close={close}
          />

          {installed && installed.length > 0 && (
            <Section
              heading={ax("এই কম্পিউটারে ইনস্টল করা ({n})").replace("{n}", String(installed.length))}
              fonts={installed}
              close={close}
            />
          )}

          {/* Word lists system fonts outright; a browser needs permission. */}
          {!installed && canReadInstalledFonts() && (
            <div className="border-t border-[#e1dfdd] p-2">
              <button
                type="button"
                onMouseDown={keepFocus}
                onClick={loadFromMachine}
                disabled={loading}
                className="w-full rounded-sm border border-[#d4d4d4] px-2 py-1 font-ui text-[11px] text-[#333] hover:bg-[#e1dfdd] disabled:opacity-50"
              >
                {loading
                  ? ax("আনা হচ্ছে…")
                  : ax("＋ এই কম্পিউটারের সব ফন্ট আনুন")}
              </button>
              {denied && (
                <p className="mt-1.5 font-ui text-[10px] leading-snug text-[#a8151b]">
                  {ax(
                    "অনুমতি পাওয়া যায়নি। ঠিকানা বারের 🔒 আইকনে গিয়ে ফন্টের অনুমতি দিন, তারপর আবার চেষ্টা করুন।",
                  )}
                </p>
              )}
            </div>
          )}

          {!canReadInstalledFonts() && (
            <p className="border-t border-[#e1dfdd] px-3 py-2 font-ui text-[10px] leading-snug text-[#666]">
              {ax(
                "কম্পিউটারে ইনস্টল করা ফন্ট আনার সুবিধাটি Chrome/Edge ডেস্কটপে পাওয়া যায়।",
              )}
            </p>
          )}
        </>
      )}
    </Combo>
  );
}
