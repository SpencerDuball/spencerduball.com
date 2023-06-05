import { SubmitOptions, useFetcher } from "@remix-run/react";
import * as React from "react";
import {
  CmsEditorCtx,
  InitialCmsEditorState,
  ZCmsEditorSettings,
  Types,
  CmsEditorSettingsKey,
  ICmsEditorState,
} from ".";
import { IAttachment } from "~/model/attachment";
import { Vim, vim } from "@replit/codemirror-vim";
import { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { useDropArea } from "react-use";

export interface IUseInitializeCmsEditor {
  attachments: IAttachment[];
  value: string;
  saveSubmitOptions: SubmitOptions;
  uploadFn: NonNullable<ICmsEditorState["server"]>["attachment"]["upload"];
}

/**
 * Initialize the cms editor.
 *
 * - Will return & subscribe to all fetcher updates.
 * - Will initialize editor data & settings.
 * - Will define common vim commands.
 */
export function useInitializeCmsEditor({ attachments, value, saveSubmitOptions, uploadFn }: IUseInitializeCmsEditor) {
  const fetcher = useFetcher<{ body: string }>();
  const [state, dispatch] = React.useContext(CmsEditorCtx);

  // Update When New Data
  // -----------------------------------------
  React.useEffect(() => {
    dispatch({ type: Types.SetState, payload: { ...state, data: { ...state.data, attachments, value } } });
  }, [JSON.stringify(attachments), value]);

  // Subscribe to Fetcher Updates
  // ----------------------------
  React.useEffect(() => {
    if (fetcher.state === "submitting" && state.data.value !== fetcher.formData.get("body")) {
      const value = fetcher.formData.get("body")?.toString() || state.data.value;
      dispatch({ type: Types.SetValue, payload: { value, prettify: true } });
    }
    dispatch({ type: Types.SetFetcher, payload: fetcher });
  }, [fetcher]);

  // Initialize Editor Data
  // ----------------------
  // (1) Update the settings from localStorage if exists
  // (2) Initialize the data (attachments & value)
  let initialized = false;
  React.useEffect(() => {
    if (!initialized) {
      let settings = { ...InitialCmsEditorState.settings };

      // restore settings if exists
      try {
        const settingsStr = localStorage.getItem(CmsEditorSettingsKey);
        settings = ZCmsEditorSettings.parse(JSON.parse(settingsStr || ""));
      } catch (e) {
        localStorage.setItem(CmsEditorSettingsKey, JSON.stringify(settings));
      }

      // update the context
      dispatch({
        type: Types.SetState,
        payload: {
          ...state,
          settings,
          data: { ...state.data, attachments, value },
          server: { save: { fetcher, submitOptions: saveSubmitOptions }, attachment: { upload: uploadFn } },
        },
      });
    }
  }, []);

  // Define the Vim Commands
  // -----------------------
  React.useEffect(() => {
    if (state.settings.mode === "vim") {
      Vim.defineEx("write", "w", function () {
        if (state.server?.save.fetcher.state === "idle" && value !== state.data.value) {
          dispatch({ type: Types.SetValue, payload: { value: state.data.value, prettify: true, save: true } });
        }
      });
    }
  }, [state.settings.mode, state.data.value, state.server?.save.fetcher.state]);

  return { fetcher };
}

export interface IUseCmsEditor {
  scrollBoxRef: React.MutableRefObject<HTMLDivElement>;
}
export function useCmsEditor({ scrollBoxRef }: IUseCmsEditor) {
  const [state, dispatch] = React.useContext(CmsEditorCtx);
  const [initialized, setInitialized] = React.useState(false);

  // Restore Scroll Position
  // --------------------------
  React.useEffect(() => {
    if (scrollBoxRef.current) {
      scrollBoxRef.current.scrollTo(state.editor.pos.x, state.editor.pos.y);
      setInitialized(true);
    }
  }, []);

  // Define CodeMirror Props
  // -----------------------
  // (1) Defines the editor value
  // (2) Defines editor extensions
  // (3) Defines event handlers
  const [dropAreaHandlers] = useDropArea({
    onFiles: async (files, e) => {
      for (let file of files) {
        const target = e.target as HTMLElement;

        // create the record
        if (!state.server) return;
        const { attachment, upload } = await state.server!.attachment.upload(file);

        const localUrl = URL.createObjectURL(file);
        let lines: string[];
        if (target.className.includes("cm-line")) {
          // if input on specific line, append to that line
          const lineIdx = Array.from(target.parentNode!.children).indexOf(target);
          lines = state.data.value.split("\n");
          if (file.type.match(/^image\//)) lines.splice(lineIdx, 0, `![Add description ...](${localUrl})`);
          else if (file.type.match(/^video\//)) lines.splice(lineIdx, 0, `<Video url="${localUrl}" />`);

          // update the value
          dispatch({ type: Types.SetValue, payload: { value: lines.join("\n"), prettify: true } });
        } else {
          // if input to editor as a whole, add a new line
          lines = state.data.value.split("\n");
          if (file.type.match(/^image\//)) lines.push(`![Add description ...](${localUrl})`);
          else if (file.type.match(/^video\//)) lines.push(`![Add description ...](${localUrl})`);

          // update the value
          dispatch({ type: Types.SetValue, payload: { value: lines.join("\n"), prettify: true } });
        }

        // upload the attachment & replace with remote url when finished
        await upload();
        dispatch({
          type: Types.SetValue,
          payload: { value: lines.join("\n").replace(new RegExp(localUrl, "g"), attachment.url), prettify: true },
        });
      }
    },
    onUri: (uri, e) => {
      console.log(uri);
      console.log(e);
    },
  });
  const codeMirrorProps: ReactCodeMirrorProps = {
    value: state.data.value,
    extensions: [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      state.settings.lineWrap ? EditorView.lineWrapping : [],
      state.settings.mode === "vim" ? vim() : [],
    ],
    onChange: function (value, viewUpdate) {
      dispatch({ type: Types.SetValue, payload: { value } });
      if (scrollBoxRef.current) {
        const pos = { x: scrollBoxRef.current.scrollLeft, y: scrollBoxRef.current.scrollTop };
        dispatch({ type: Types.SetScroll, payload: pos });
      }
    },
    // disable auto-zoom on iOS
    // ------------------------
    // On iOS we will disable the zoom on touchStart, this will prevent the auto-zoom
    // happening on text less than 16px.
    onTouchStart: function (e) {
      if (typeof window !== undefined) {
        const el = document.querySelector("meta[name=viewport]");

        if (el !== null) {
          let content = el.getAttribute("content") || "";
          let re = /maximum\-scale=[0-9\.]+/g;

          if (re.test(content)) content = content.replace(re, "maximum-scale=1.0");
          else {
            let items = content
              .split(",")
              .map((i) => i.trim())
              .filter((i) => i !== "");
            content = [...items, "maximum-scale=1.0"].join(",");
          }

          el.setAttribute("content", content);
        }
      }
    },
    // enable auto-zoom on iOS
    // -----------------------
    // On iOS we will enable the zoom onBlur, this will allow normal zoom to be used
    // after we are finished with the editor input.
    onBlur: function (e) {
      if (typeof window !== undefined) {
        const el = document.querySelector("meta[name=viewport]");
        if (el !== null) {
          let content = el.getAttribute("content") || "";
          let re = /,?\w?maximum\-scale=[0-9\.]+/g;

          if (re.test(content)) content = content.replace(re, "");

          el.setAttribute("content", content);
        }
      }
    },
    ...dropAreaHandlers,
  };

  const scrollBoxProps: React.ComponentPropsWithoutRef<"div"> = {
    onScroll: function (e) {
      if (scrollBoxRef.current)
        dispatch({
          type: Types.SetScroll,
          payload: { x: scrollBoxRef.current.scrollLeft, y: scrollBoxRef.current.scrollTop },
        });
    },
  };

  return { initialized, codeMirrorProps, scrollBoxProps };
}
