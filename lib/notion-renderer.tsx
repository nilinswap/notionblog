import React from "react";
import Link from "next/link";

type NotionAnnotations = {
  code?: boolean;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  color?: string;
};

type NotionRichTextFragment = {
  plain_text?: string;
  href?: string;
  annotations?: NotionAnnotations;
};

type NotionRichText = NotionRichTextFragment[];

type NotionBlock = {
  id: string;
  type: string;
  [key: string]: unknown;
};

type NotionBlockGroup = { type: string; items: NotionBlock[] } | NotionBlock;

type NotionRecord = Record<string, unknown>;

function renderRichText(richText: NotionRichText) {
  return richText.map((fragment, index) => {
    const text = fragment.plain_text || "";
    const annotations = fragment.annotations || {};
    let content: React.ReactNode = text;

    if (fragment.href) {
      content = (
        <a key={index} href={fragment.href} className="text-orange-600 hover:underline">
          {text}
        </a>
      );
    }

    if (annotations.code) {
      content = <code className="rounded bg-slate-100 px-1 py-0.5">{text}</code>;
    } else if (annotations.bold) {
      content = <strong>{content}</strong>;
    } else if (annotations.italic) {
      content = <em>{content}</em>;
    } else if (annotations.strikethrough) {
      content = <del>{content}</del>;
    } else if (annotations.underline) {
      content = <u>{content}</u>;
    }

    if (annotations.color && annotations.color !== "default") {
      content = <span style={{ color: annotations.color }}>{content}</span>;
    }

    return <React.Fragment key={index}>{content}</React.Fragment>;
  });
}

export function NotionBlock({ block }: { block: NotionBlock }) {
  const type = block.type;
  const value = block[type] as NotionRecord;

  switch (type) {
    case "paragraph":
      return <p>{renderRichText(value.rich_text as NotionRichText)}</p>;
    case "heading_1":
      return <h1>{renderRichText(value.rich_text as NotionRichText)}</h1>;
    case "heading_2":
      return <h2>{renderRichText(value.rich_text as NotionRichText)}</h2>;
    case "heading_3":
      return <h3>{renderRichText(value.rich_text as NotionRichText)}</h3>;
    case "quote":
      return <blockquote>{renderRichText(value.rich_text as NotionRichText)}</blockquote>;
    case "code":
      return (
        <pre className="rounded bg-slate-900 p-4 text-sm text-slate-100">
          <code>{((value.rich_text as NotionRichText) || []).map((r) => r.plain_text || "").join("")}</code>
        </pre>
      );
    case "bulleted_list_item":
      return <li>{renderRichText(value.rich_text as NotionRichText)}</li>;
    case "numbered_list_item":
      return <li>{renderRichText(value.rich_text as NotionRichText)}</li>;
    case "callout":
      return (
        <div className="rounded border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold">{renderRichText(value.rich_text as NotionRichText)}</div>
        </div>
      );
    case "divider":
      return <hr className="my-6 border-slate-200" />;
    case "image": {
      const src = value.type === "external" ? (value.external as { url?: string })?.url : (value.file as { url?: string })?.url;
      const caption = ((value.caption as NotionRichText) || []).map((item) => item.plain_text || "").join("") || "";
      return (
        <figure>
          <div className="overflow-hidden rounded-xl bg-slate-100">
            <img src={src} alt={caption || "Notion image"} className="w-full object-contain" />
          </div>
          {caption ? <figcaption className="mt-2 text-sm text-slate-500">{caption}</figcaption> : null}
        </figure>
      );
    }
    case "bookmark":
      return (
        <div className="rounded border border-slate-200 bg-slate-50 p-4">
          <Link href={(value.url as string) || "#"} className="text-orange-600 hover:underline" target="_blank">
            {value.url as string}
          </Link>
        </div>
      );
    case "toggle":
      return (
        <details className="rounded border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer font-semibold">{renderRichText(value.rich_text as NotionRichText)}</summary>
          {Array.isArray(value.children)
            ? (value.children as NotionBlock[]).map((child) => <NotionBlock key={child.id} block={child} />)
            : null}
        </details>
      );
    default:
      return <div className="italic text-slate-500">[{type} block not rendered yet]</div>;
  }
}

export function NotionBlockList({ blocks }: { blocks: unknown[] }) {
  const groups: NotionBlockGroup[] = [];

  blocks.forEach((blockItem) => {
    const block = blockItem as NotionBlock;
    const type = block.type;
    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      const last = groups[groups.length - 1] as NotionBlockGroup | undefined;
      if (last && "items" in last && last.type === type) {
        (last as { items: NotionBlock[] }).items.push(block);
        return;
      }
      groups.push({ type, items: [block] });
    } else {
      groups.push(block);
    }
  });

  return (
    <>
      {groups.map((group, idx) => {
        if ("items" in group && group.type === "bulleted_list_item") {
          const items = (group as { items: NotionBlock[] }).items;
          return (
            <ul key={idx} className="list-disc space-y-2 pl-6">
              {items.map((item) => (
                <NotionBlock key={item.id} block={item} />
              ))}
            </ul>
          );
        }
        if ("items" in group && group.type === "numbered_list_item") {
          const items = (group as { items: NotionBlock[] }).items;
          return (
            <ol key={idx} className="list-decimal space-y-2 pl-6">
              {items.map((item) => (
                <NotionBlock key={item.id} block={item} />
              ))}
            </ol>
          );
        }
        const block = group as NotionBlock;
        return <NotionBlock key={block.id} block={block} />;
      })}
    </>
  );
}
