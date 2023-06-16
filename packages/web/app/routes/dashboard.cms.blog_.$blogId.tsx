import { LoaderArgs, json, redirect, V2_MetaFunction } from "@remix-run/node";
import { getLogger, getPgClient, logRequest } from "~/lib/util.server";
import { z } from "zod";
import { getSessionInfo } from "~/lib/session.server";
import { Outlet, Link, useLoaderData, useLocation, ShouldRevalidateFunction } from "@remix-run/react";
import { IconButton } from "~/components/ui/button";
import {
  RiSaveLine,
  RiCodeSSlashFill,
  RiArticleLine,
  RiAttachment2,
  RiMoonFill,
  RiSunFill,
  RiTextWrap,
} from "react-icons/ri";
import { SiPrettier } from "react-icons/si";
import { RxHalf2 } from "react-icons/rx";
import { DiVim } from "react-icons/di";
import * as React from "react";
import {
  CmsEditorCtx,
  CmsEditorProvider,
  Types as CmsEditorTypes,
  useInitializeCmsEditor,
} from "~/components/app/cms-editor-ctx";
import { ZAttachment, onUploadProgress } from "~/model/attachment";
import { ToasterCtx, Types as ToasterTypes } from "~/components/app/toaster";
import axios from "axios";
import { createAttachment } from "~/model/attachment.server";
import ms from "ms";
import Markdoc from "@markdoc/markdoc";

/* ------------------------------------------------------------------------------------------------------------
 * Define Blog Context
 * -----------------------
 * We have two context components; the CmsEditorCtx that handles the more generic contenxt specific only to the
 * cms editor, and the blog context that handles displaying blog-specific context to other sub-routes.
 * ------------------------------------------------------------------------------------------------------------ */
export const ZBlogState = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  image_url: z.string(),
  body: z.string(),
  author_id: z.number(),
  views: z.number(),
  published: z.boolean(),
  published_at: z.null().or(z.coerce.date()),
  body_modified_at: z.coerce.date(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
  attachments: ZAttachment.omit({ upload_pct: true }).array(),
});
export type IBlogState = z.infer<typeof ZBlogState>;
export const InitialBlogState: IBlogState = {
  id: -1,
  title: "",
  description: "",
  image_url: "",
  body: "",
  author_id: -1,
  views: -1,
  published: false,
  published_at: null,
  body_modified_at: new Date("1970-01-01T00:00:00.000Z"),
  created_at: new Date("1970-01-01T00:00:00.000Z"),
  modified_at: new Date("1970-01-01T00:00:00.000Z"),
  attachments: [],
};
export const BlogCtx = React.createContext<[IBlogState, React.Dispatch<IBlogState>]>([InitialBlogState, () => null]);
export function BlogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState(InitialBlogState);
  return <BlogCtx.Provider value={[state, setState]}>{children}</BlogCtx.Provider>;
}

/* ------------------------------------------------------------------------------------------------------------
 * Define Page
 * ------------------------------------------------------------------------------------------------------------ */

const ZParams = z.object({ blogId: z.coerce.number() });

export async function loader({ request, params }: LoaderArgs) {
  await logRequest(request);

  // ensure user is admin
  const session = await getSessionInfo(request, "required");
  if (!session.roles.includes("admin")) return redirect("/");

  // get request info
  const blogId = ZParams.parse(params).blogId;

  // default redirect to "/edit" if root path
  const pattern = `/dashboard/cms/blog/${blogId}/?$`;
  if (!!new URL(request.url).pathname.match(new RegExp(pattern))) return redirect(`/dashboard/cms/blog/${blogId}/edit`);

  // get utilities
  const logger = getLogger();
  const db = await getPgClient();

  // retrieve blogpost
  logger.info("Retrieveing the blog ...");
  const [blog, attachments] = await Promise.all([
    db.selectFrom("blogs").where("id", "=", blogId).selectAll().executeTakeFirstOrThrow(),
    db.selectFrom("attachments").where("blog_id", "=", blogId).selectAll().execute(),
  ]);

  logger.info("Success: Retrieved the blog.");

  return json({ blog: { ...blog, attachments } });
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: `Not Found | Spencer Duball` }];
  return [
    { title: `${data.blog.title} | Spencer Duball` },
    { name: "description", content: data.blog.description },
    { name: "og:title", content: `${data.blog.title} | Spencer Duball` },
    { name: "og:description", content: data.blog.description },
    { name: "og:type", content: "website" },
    { name: "og:image", content: data.blog.image_url },
    { name: "robots", content: "index,follow" },
  ];
};

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction, defaultShouldRevalidate }) => {
  if (formAction?.match(/\/dashboard\/cms\/blog\/\d+\/preview/)) return false;
  return defaultShouldRevalidate;
};

/** Define the save handler & effects. */
function useToastOnSave() {
  const [state] = React.useContext(CmsEditorCtx);
  const [, dispatch] = React.useContext(ToasterCtx);

  React.useEffect(() => {
    if (
      state.server &&
      state.server.save.fetcher.formMethod === state.server.save.submitOptions.method &&
      state.server.save.fetcher.formAction === state.server.save.submitOptions.action
    ) {
      if (state.server.save.fetcher.state === "submitting") {
        dispatch({
          type: ToasterTypes.UpsertToast,
          payload: {
            id: "blog-save-toast",
            title: "Saving ...",
            description: "Saving the blog.",
            placement: "bottom-end",
            duration: Infinity,
          },
        });
      } else if (state.server.save.fetcher.state === "loading")
        dispatch({
          type: ToasterTypes.UpdateToast,
          payload: {
            id: "blog-save-toast",
            type: "success",
            title: "Saved!",
            description: "Saved the blog.",
            duration: 3000,
          },
        });
    }
  }, [state.server?.save.fetcher.state]);
}

function Blog() {
  const { blog } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [state, dispatch] = React.useContext(CmsEditorCtx);
  const [, toasterDispatch] = React.useContext(ToasterCtx);

  // initialize the blog context
  const [, setBlogCtx] = React.useContext(BlogCtx);
  React.useEffect(() => setBlogCtx(ZBlogState.parse(blog)), [blog]);

  // initialize the editor data
  const { fetcher: save } = useInitializeCmsEditor({
    value: blog.body,
    attachments: blog.attachments.map((attachment) => ZAttachment.parse({ ...attachment, upload_pct: 100 })),
    saveSubmitOptions: { method: "PATCH", action: `/blog/${blog.id}?index` },
    uploadFn: async (file: File) => {
      // create attachment SQL record & presignedPost
      const { attachment, presignedPost } = await axios
        .postForm<ReturnType<typeof createAttachment>>(`/attachment?_data`, {
          size: file.size,
          type: file.type,
          blog_id: blog.id,
          is_unused: true,
          expires_at: new Date(new Date().getTime() + ms("14d")),
        })
        .then((res) => res.data);

      // define the upload function
      const upload = async () =>
        axios.postForm(
          presignedPost.url,
          { ...presignedPost.fields, file: await file.arrayBuffer() },
          { onUploadProgress: onUploadProgress({ file, attachment, editorDispatch: dispatch, toasterDispatch }) }
        );

      return { attachment, upload };
    },
  });

  // setup the UI specific features
  useToastOnSave();

  // determine the theme icon
  let themeIcon = <RxHalf2 />;
  if (state.settings.theme === "dark") themeIcon = <RiMoonFill />;
  else if (state.settings.theme === "light") themeIcon = <RiSunFill />;

  return (
    // theme(space.20) corresponds to the height of the header component
    <div className="w-full max-w-5xl h-[calc(100dvh-theme(space.20))] py-6 px-4">
      <div className="grid grid-rows-[max-content_2fr] w-full h-full gap-2">
        {/* Toolbar */}
        <div className="grid grid-flow-col justify-self-center justify-center gap-1.5 p-1.5 rounded-lg bg-slate-2 border-slate-4 border shadow-sm">
          <div className="grid grid-flow-col gap-1">
            <save.Form method="patch" action={`/blog/${blog.id}?index`}>
              <input type="hidden" name="body" value={Markdoc.format(Markdoc.parse(state.data.value))} />
              <IconButton
                type="submit"
                size="sm"
                aria-label="save edits"
                variant="ghost"
                icon={<RiSaveLine />}
                isDisabled={Markdoc.format(Markdoc.parse(state.data.value)) === blog.body}
                isLoading={save.state !== "idle"}
              />
            </save.Form>
            <IconButton
              size="sm"
              aria-label="format"
              variant="ghost"
              icon={<SiPrettier className="h-3 w-3" />}
              onClick={() =>
                dispatch({ type: CmsEditorTypes.SetValue, payload: { value: state.data.value, prettify: true } })
              }
            />
          </div>
          <div className="h-full w-px bg-slate-5" />
          <div className="grid grid-flow-col gap-1">
            <Link to={`/dashboard/cms/blog/${blog.id}/edit`}>
              <IconButton
                size="sm"
                isActive={location.pathname.endsWith("/edit")}
                aria-label="toggle edit"
                variant="ghost"
                icon={<RiCodeSSlashFill />}
              />
            </Link>
            <Link to={`/dashboard/cms/blog/${blog.id}/preview`}>
              <IconButton
                size="sm"
                isActive={location.pathname.endsWith("/preview")}
                aria-label="toggle preview"
                variant="ghost"
                icon={<RiArticleLine />}
              />
            </Link>
            <Link to={`/dashboard/cms/blog/${blog.id}/attachments`}>
              <IconButton
                size="sm"
                isActive={location.pathname.endsWith("/attachments")}
                aria-label="toggle attachments"
                variant="ghost"
                icon={<RiAttachment2 />}
              />
            </Link>
          </div>
          <div className="h-full w-px bg-slate-5" />
          <div className="grid grid-flow-col gap-1">
            <IconButton
              size="sm"
              aria-label="save edits"
              variant="ghost"
              icon={themeIcon}
              onClick={() => dispatch({ type: CmsEditorTypes.ToggleTheme })}
            />
            <IconButton
              size="sm"
              aria-label="toggle vim"
              variant="ghost"
              icon={<DiVim />}
              isActive={state.settings.mode === "vim"}
              onClick={() => dispatch({ type: CmsEditorTypes.ToggleMode })}
            />
            <IconButton
              size="sm"
              aria-label="toggle text-wrap"
              variant="ghost"
              icon={<RiTextWrap />}
              isActive={state.settings.lineWrap === true}
              onClick={() => dispatch({ type: CmsEditorTypes.ToggleLineWrap })}
            />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default function BlogWithContext() {
  return (
    <BlogProvider>
      <CmsEditorProvider>
        <Blog />
      </CmsEditorProvider>
    </BlogProvider>
  );
}
