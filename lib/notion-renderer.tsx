import React from "react";
import Link from "next/link";
import Image from "next/image";

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

export type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  [key: string]: unknown;
};

type NotionListGroup = {
  type: "bulleted_list_item" | "numbered_list_item" | "to_do";
  items: NotionBlock[];
};

type NotionBlockGroup = NotionListGroup | NotionBlock;

function isListGroup(group: NotionBlockGroup): group is NotionListGroup {
  return "items" in group;
}

type NotionRecord = Record<string, unknown>;

const LIST_ITEM_TYPES = new Set(["bulleted_list_item", "numbered_list_item", "to_do"]);

function richTextToPlain(richText: NotionRichText) {
  return richText.map((fragment) => fragment.plain_text || "").join("");
}

function getBlockValue(block: NotionBlock) {
  return block[block.type] as NotionRecord;
}

function getMediaUrl(value: NotionRecord) {
  if (value.type === "external") {
    return (value.external as { url?: string })?.url;
  }
  return (value.file as { url?: string })?.url;
}

function renderCalloutIcon(icon: unknown) {
  if (!icon || typeof icon !== "object") return null;
  const typedIcon = icon as { type?: string; emoji?: string; external?: { url?: string }; file?: { url?: string } };
  if (typedIcon.type === "emoji" && typedIcon.emoji) {
    return <span className="text-xl leading-none">{typedIcon.emoji}</span>;
  }
  const iconUrl = typedIcon.type === "external" ? typedIcon.external?.url : typedIcon.file?.url;
  if (iconUrl) {
    return <Image width={240} height={240} src={iconUrl} alt="" />;
  }
  return null;
}

export function renderRichText(richText: NotionRichText) {
  return richText.map((fragment, index) => {
    let content: React.ReactNode = fragment.plain_text || "";
    const annotations = fragment.annotations || {};

    if (fragment.href) {
      content = (
        <a href={fragment.href} className="text-orange-600 hover:underline">
          {content}
        </a>
      );
    }

    if (annotations.code) {
      content = <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">{content}</code>;
    }
    if (annotations.bold) content = <strong>{content}</strong>;
    if (annotations.italic) content = <em>{content}</em>;
    if (annotations.strikethrough) content = <del>{content}</del>;
    if (annotations.underline) content = <u>{content}</u>;

    if (annotations.color && annotations.color !== "default") {
      content = <span className={`notion-color-${annotations.color}`}>{content}</span>;
    }

    return <React.Fragment key={index}>{content}</React.Fragment>;
  });
}

function NotionBlockChildren({ blocks }: { blocks?: NotionBlock[] }) {
  if (!blocks?.length) return null;
  return (
    <div className="mt-3 space-y-3">
      <NotionBlockList blocks={blocks} />
    </div>
  );
}

function NotionParagraph({ value }: { value: NotionRecord }) {
  return <p>{renderRichText(value.rich_text as NotionRichText)}</p>;
}

function NotionHeading({ level, value }: { level: 1 | 2 | 3 | 4; value: NotionRecord }) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  const sizes = {
    1: "text-3xl font-bold",
    2: "text-2xl font-bold",
    3: "text-xl font-semibold",
    4: "text-lg font-semibold",
  };
  return <Tag className={sizes[level]}>{renderRichText(value.rich_text as NotionRichText)}</Tag>;
}

function NotionQuote({ value }: { value: NotionRecord }) {
  return (
    <blockquote className="border-l-4 border-orange-400 bg-orange-50/60 py-2 pl-4 pr-3 italic text-slate-700">
      {renderRichText(value.rich_text as NotionRichText)}
    </blockquote>
  );
}

function NotionCode({ value }: { value: NotionRecord }) {
  const language = (value.language as string) || "text";
  const caption = richTextToPlain((value.caption as NotionRichText) || []);
  return (
    <figure className="space-y-2">
      {language !== "plain text" && language !== "text" ? (
        <figcaption className="text-xs font-medium uppercase tracking-wide text-slate-500">{language}</figcaption>
      ) : null}
      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
        <code>{richTextToPlain((value.rich_text as NotionRichText) || [])}</code>
      </pre>
      {caption ? <figcaption className="text-sm text-slate-500">{caption}</figcaption> : null}
    </figure>
  );
}

function NotionListItem({
  value,
  childBlocks,
}: {
  value: NotionRecord;
  childBlocks?: NotionBlock[];
}) {
  return (
    <li className="space-y-2">
      {renderRichText(value.rich_text as NotionRichText)}
      <NotionBlockChildren blocks={childBlocks} />
    </li>
  );
}

function NotionToDo({ value, childBlocks }: { value: NotionRecord; childBlocks?: NotionBlock[] }) {
  const checked = Boolean(value.checked);
  return (
    <li className="list-none space-y-2">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          readOnly
          disabled
          className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-500"
        />
        <span className={checked ? "text-slate-400 line-through" : "text-slate-800"}>
          {renderRichText(value.rich_text as NotionRichText)}
        </span>
      </label>
      <NotionBlockChildren blocks={childBlocks} />
    </li>
  );
}

function NotionCallout({ value }: { value: NotionRecord }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="shrink-0 pt-0.5">{renderCalloutIcon(value.icon)}</div>
      <div className="min-w-0 text-sm text-slate-800">{renderRichText(value.rich_text as NotionRichText)}</div>
    </div>
  );
}

function NotionDivider() {
  return <hr className="my-6 border-slate-200" />;
}

function NotionImage({ value }: { value: NotionRecord }) {
  const src = getMediaUrl(value);
  const caption = richTextToPlain((value.caption as NotionRichText) || "");
  if (!src) return null;
  return (
    <figure className="space-y-2">
      <div className="overflow-hidden rounded-xl bg-slate-100">
        <Image src={src} alt={caption || "Notion image"} className="w-full object-contain" />
      </div>
      {caption ? <figcaption className="text-sm text-slate-500">{caption}</figcaption> : null}
    </figure>
  );
}

function NotionVideo({ value }: { value: NotionRecord }) {
  const src = getMediaUrl(value);
  const caption = richTextToPlain((value.caption as NotionRichText) || "");
  if (!src) return null;
  return (
    <figure className="space-y-2">
      <div className="overflow-hidden rounded-xl bg-slate-100">
        <video src={src} controls className="w-full" />
      </div>
      {caption ? <figcaption className="text-sm text-slate-500">{caption}</figcaption> : null}
    </figure>
  );
}

function NotionAudio({ value }: { value: NotionRecord }) {
  const src = getMediaUrl(value);
  const caption = richTextToPlain((value.caption as NotionRichText) || "");
  if (!src) return null;
  return (
    <figure className="space-y-2">
      <audio src={src} controls className="w-full" />
      {caption ? <figcaption className="text-sm text-slate-500">{caption}</figcaption> : null}
    </figure>
  );
}

function NotionFile({ value, label }: { value: NotionRecord; label: string }) {
  const src = getMediaUrl(value);
  const caption = richTextToPlain((value.caption as NotionRichText) || "");
  const name = (value.name as string) || label;
  if (!src) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <Link href={src} className="font-medium text-orange-600 hover:underline" target="_blank">
        {name}
      </Link>
      {caption ? <p className="mt-1 text-sm text-slate-500">{caption}</p> : null}
    </div>
  );
}

function NotionEmbed({ value }: { value: NotionRecord }) {
  const src = (value.url as string) || getMediaUrl(value);
  const caption = richTextToPlain((value.caption as NotionRichText) || "");
  if (!src) return null;
  return (
    <figure className="space-y-2">
      <div className="overflow-hidden rounded-xl bg-slate-100">
        <iframe src={src} title={caption || "Embedded content"} className="aspect-video w-full border-0" allowFullScreen />
      </div>
      {caption ? <figcaption className="text-sm text-slate-500">{caption}</figcaption> : null}
    </figure>
  );
}

function NotionBookmark({ value }: { value: NotionRecord }) {
  const url = (value.url as string) || "";
  const caption = richTextToPlain((value.caption as NotionRichText) || "");
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <Link href={url || "#"} className="font-medium text-orange-600 hover:underline" target="_blank">
        {caption || url}
      </Link>
      {caption && url ? <p className="mt-1 truncate text-sm text-slate-500">{url}</p> : null}
    </div>
  );
}

function NotionLinkPreview({ value }: { value: NotionRecord }) {
  const url = (value.url as string) || "";
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <Link href={url || "#"} className="font-medium text-orange-600 hover:underline" target="_blank">
        {url}
      </Link>
    </div>
  );
}

function NotionToggle({ value, childBlocks }: { value: NotionRecord; childBlocks?: NotionBlock[] }) {
  return (
    <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <summary className="cursor-pointer font-semibold text-slate-900">
        {renderRichText(value.rich_text as NotionRichText)}
      </summary>
      <NotionBlockChildren blocks={childBlocks} />
    </details>
  );
}

function NotionTable({ block, value }: { block: NotionBlock; value: NotionRecord }) {
  const rows = block.children?.filter((child) => child.type === "table_row") || [];
  const hasColumnHeader = Boolean(value.has_column_header);
  const hasRowHeader = Boolean(value.has_row_header);

  if (!rows.length) {
    return <div className="text-sm italic text-slate-500">[empty table]</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full border-collapse text-sm">
        <tbody>
          {rows.map((row, rowIndex) => {
            const rowValue = getBlockValue(row);
            const cells = (rowValue.cells as NotionRichText[]) || [];
            const isHeaderRow = hasColumnHeader && rowIndex === 0;

            return (
              <tr key={row.id} className="border-b border-slate-200 last:border-b-0">
                {cells.map((cell, cellIndex) => {
                  const isHeaderCell = isHeaderRow || (hasRowHeader && cellIndex === 0);
                  const CellTag = isHeaderCell ? "th" : "td";
                  return (
                    <CellTag
                      key={`${row.id}-${cellIndex}`}
                      className={`border-r border-slate-200 px-3 py-2 align-top last:border-r-0 ${
                        isHeaderCell ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {renderRichText(cell)}
                    </CellTag>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NotionTableRow({ value }: { value: NotionRecord }) {
  const cells = (value.cells as NotionRichText[]) || [];
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full border-collapse text-sm">
        <tbody>
          <tr>
            {cells.map((cell, index) => (
              <td key={index} className="border border-slate-200 px-3 py-2 align-top text-slate-700">
                {renderRichText(cell)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function NotionColumnList({ childBlocks }: { childBlocks?: NotionBlock[] }) {
  const columns = childBlocks?.filter((child) => child.type === "column") || [];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {columns.map((column) => (
        <NotionColumn key={column.id} block={column} />
      ))}
    </div>
  );
}

function NotionColumn({ block }: { block: NotionBlock }) {
  return (
    <div className="min-w-0 space-y-3">
      <NotionBlockList blocks={block.children || []} />
    </div>
  );
}

function NotionEquation({ value }: { value: NotionRecord }) {
  const expression = (value.expression as string) || "";
  return (
    <div className="overflow-x-auto rounded-lg bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800">
      {expression}
    </div>
  );
}

function NotionSyncedBlock({ childBlocks }: { childBlocks?: NotionBlock[] }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-3">
      <NotionBlockList blocks={childBlocks || []} />
    </div>
  );
}

function NotionChildPage({ value }: { value: NotionRecord }) {
  const title = (value.title as string) || "Untitled page";
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      {title}
    </div>
  );
}

function NotionTableOfContents() {
  return (
    <nav className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      Table of contents
    </nav>
  );
}

function NotionUnsupported({ type }: { type: string }) {
  return <div className="text-sm italic text-slate-500">[{type} block not rendered yet]</div>;
}

export function NotionBlock({ block }: { block: NotionBlock }) {
  const type = block.type;
  const value = getBlockValue(block);
  const childBlocks = block.children;

  switch (type) {
    case "paragraph":
      return <NotionParagraph value={value} />;
    case "heading_1":
      return <NotionHeading level={1} value={value} />;
    case "heading_2":
      return <NotionHeading level={2} value={value} />;
    case "heading_3":
      return <NotionHeading level={3} value={value} />;
    case "heading_4":
      return <NotionHeading level={4} value={value} />;
    case "quote":
      return <NotionQuote value={value} />;
    case "code":
      return <NotionCode value={value} />;
    case "bulleted_list_item":
      return <NotionListItem value={value} childBlocks={childBlocks} />;
    case "numbered_list_item":
      return <NotionListItem value={value} childBlocks={childBlocks} />;
    case "to_do":
      return <NotionToDo value={value} childBlocks={childBlocks} />;
    case "callout":
      return <NotionCallout value={value} />;
    case "divider":
      return <NotionDivider />;
    case "image":
      return <NotionImage value={value} />;
    case "video":
      return <NotionVideo value={value} />;
    case "audio":
      return <NotionAudio value={value} />;
    case "file":
      return <NotionFile value={value} label="Download file" />;
    case "pdf":
      return <NotionFile value={value} label="Open PDF" />;
    case "embed":
      return <NotionEmbed value={value} />;
    case "bookmark":
      return <NotionBookmark value={value} />;
    case "link_preview":
      return <NotionLinkPreview value={value} />;
    case "toggle":
      return <NotionToggle value={value} childBlocks={childBlocks} />;
    case "table":
      return <NotionTable block={block} value={value} />;
    case "table_row":
      return <NotionTableRow value={value} />;
    case "column_list":
      return <NotionColumnList childBlocks={childBlocks} />;
    case "column":
      return <NotionColumn block={block} />;
    case "equation":
      return <NotionEquation value={value} />;
    case "synced_block":
      return <NotionSyncedBlock childBlocks={childBlocks} />;
    case "child_page":
      return <NotionChildPage value={value} />;
    case "child_database":
      return <NotionChildPage value={{ title: "Database" }} />;
    case "table_of_contents":
      return <NotionTableOfContents />;
    case "breadcrumb":
      return null;
    default:
      return <NotionUnsupported type={type} />;
  }
}

export function NotionBlockList({ blocks }: { blocks: unknown[] }) {
  const groups: NotionBlockGroup[] = [];

  blocks.forEach((blockItem) => {
    const block = blockItem as NotionBlock;
    const type = block.type;
    if (LIST_ITEM_TYPES.has(type)) {
      const last = groups[groups.length - 1];
      if (last && isListGroup(last) && last.type === type) {
        last.items.push(block);
        return;
      }
      groups.push({ type: type as NotionListGroup["type"], items: [block] });
    } else {
      groups.push(block);
    }
  });

  return (
    <div className="space-y-4">
      {groups.map((group, idx) => {
        if (isListGroup(group) && group.type === "bulleted_list_item") {
          return (
            <ul key={idx} className="list-disc space-y-2 pl-6">
              {group.items.map((item) => (
                <NotionBlock key={item.id} block={item} />
              ))}
            </ul>
          );
        }
        if (isListGroup(group) && group.type === "numbered_list_item") {
          return (
            <ol key={idx} className="list-decimal space-y-2 pl-6">
              {group.items.map((item) => (
                <NotionBlock key={item.id} block={item} />
              ))}
            </ol>
          );
        }
        if (isListGroup(group) && group.type === "to_do") {
          return (
            <ul key={idx} className="space-y-2">
              {group.items.map((item) => (
                <NotionBlock key={item.id} block={item} />
              ))}
            </ul>
          );
        }

        const block = group as NotionBlock;
        return <NotionBlock key={block.id} block={block} />;
      })}
    </div>
  );
}
