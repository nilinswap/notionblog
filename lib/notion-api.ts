import { cache } from "react";
import notion from "./notion";

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

type NotionProperty =
    | { type: "title"; title?: NotionRichText }
    | { type: "rich_text"; rich_text?: NotionRichText }
    | { type: "select"; select?: { name?: string } }
    | { type: "multi_select"; multi_select?: Array<{ name?: string }> }
    | { type: "date"; date?: { start?: string } }
    | { type: "formula"; formula?: { string?: string; number?: number } }
    | { type: "relation"; relation?: Array<{ id?: string }> }
    | Record<string, unknown>;

type NotionPage = {
    id: string;
    properties?: Record<string, NotionProperty>;
    url?: string;
    [key: string]: unknown;
};

type NotionQueryResponse = {
    results: NotionPage[];
    next_cursor?: string | null;
};

type NotionSearchResponse = {
    results: NotionPage[];
};

export type BlogPostSummary = {
    id: string;
    title: string;
    slug: string;
    segmentSlug: string;
    excerpt: string;
    date: string | null;
    tags: string[];
    parentId: string | null;
};

type BlogIndex = {
    byId: Map<string, BlogPostSummary>;
    bySlug: Map<string, NotionPage>;
    roots: BlogPostSummary[];
};

const PARENT_PROPERTY_NAMES = ["Parent item", "Parent Item", "Parent"];

function richTextToString(richText: unknown) {
    if (!Array.isArray(richText)) return "";
    return richText
        .map((fragment) => {
            const typedFragment = fragment as NotionRichTextFragment;
            return typedFragment.plain_text || "";
        })
        .join("");
}

function normalizeSlug(value: string) {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-z0-9\-\/]/g, "")
        .replace(/-+/g, "-")
        .replace(/\/+/g, "/")
        .replace(/^-|-$/g, "");
}

function pageIdWithoutDashes(pageId: string) {
    return pageId.replace(/-/g, "");
}

/** Notion-style segment: title slug + hyphen + last 4 hex chars of page id */
export function pageSegmentSlug(page: NotionPage) {
    const title = (getPropertyValue(page, "Title") || getPropertyValue(page, "Name") || "untitled") as string;
    const titleSlug = normalizeSlug(title) || "untitled";
    const suffix = pageIdWithoutDashes(page.id).slice(-4);
    return `${titleSlug}-${suffix}`;
}

function getURLProperty(page: NotionPage, propertyName: string) {
    const property = page.properties?.[propertyName] as NotionProperty | undefined;
    if (!property || typeof property !== "object") return null;
    return property.url || null;
}

function getPropertyValue(page: NotionPage, propertyName: string) {
    const property = page.properties?.[propertyName] as NotionProperty | undefined;
    console.log(`Getting property "${propertyName}" from page "${page.id}":`, property, typeof property);
    if (!property || typeof property !== "object") return null;

    switch (property.type) {
        case "title":
            return richTextToString(property.title);
    
        case "rich_text":
            return richTextToString(property.rich_text);
        case "select":
            return (property as { select?: { name?: string } }).select?.name || null;
        case "multi_select":
            return (property as { multi_select?: Array<{ name?: string }> }).multi_select?.map((item) => item.name || "") || [];
        case "date":
            return (property as { date?: { start?: string } }).date?.start || null;
        case "formula":
            return (property as { formula?: { string?: string; number?: number } }).formula?.string || (property as { formula?: { string?: string; number?: number } }).formula?.number || null;
        case "relation": {
            const relation = (property as { relation?: Array<{ id?: string }> }).relation;
            if (!relation?.length) return null;
            return relation[0]?.id || null;
        }
        default:
            return null;
    }
}

function getParentPropertyName(page: NotionPage) {
    const configured = process.env.NOTION_PARENT_PROPERTY;
    if (configured && page.properties?.[configured]) {
        return configured;
    }

    for (const name of PARENT_PROPERTY_NAMES) {
        if (page.properties?.[name]) return name;
    }

    const relationParent = Object.entries(page.properties || {}).find(([name, prop]) => {
        const typed = prop as NotionProperty;
        return typed?.type === "relation" && /parent/i.test(name);
    });

    if (relationParent) return relationParent[0];

    return Object.keys(page.properties || {}).find((name) => /parent\s*item/i.test(name)) || null;
}

function getParentPageId(page: NotionPage) {
    const propertyName = getParentPropertyName(page);
    if (!propertyName) return null;
    return getPropertyValue(page, propertyName) as string | null;
}

function pageToSummary(page: NotionPage, slug: string): BlogPostSummary {
    return {
        id: page.id,
        title: (getPropertyValue(page, "Title") || getPropertyValue(page, "Name") || "Untitled") as string,
        slug,
        segmentSlug: pageSegmentSlug(page),
        excerpt: (getPropertyValue(page, "Excerpt") as string) || "",
        date: (getPropertyValue(page, "Published") as string) || (getPropertyValue(page, "Date") as string) || null,
        tags: (getPropertyValue(page, "Tags") as string[]) || [],
        parentId: getParentPageId(page),
    };
}

async function queryAllDatasourcePages() {
    const dataSourceId = process.env.NOTION_BLOG_DATASOURCE_ID;
    if (!dataSourceId) {
        return [];
    }

    const pages: NotionPage[] = [];
    let cursor: string | undefined = undefined;

    do {
        const response = await notion.dataSources.query({
            data_source_id: dataSourceId,
            sorts: [
                {
                    property: "Published",
                    direction: "descending",
                },
            ],
            start_cursor: cursor,
        });
        const typedResponse = response as unknown as NotionQueryResponse;
        pages.push(...typedResponse.results);
        cursor = typedResponse.next_cursor || undefined;
    } while (cursor);

    return pages;
}

function buildHierarchicalSlug(pageId: string, segmentById: Map<string, string>, parentById: Map<string, string | null>) {
    const segments: string[] = [];
    const visited = new Set<string>();
    let currentId: string | null = pageId;

    while (currentId) {
        if (visited.has(currentId)) break;
        visited.add(currentId);
        const segment = segmentById.get(currentId);
        if (!segment) break;
        segments.unshift(segment);
        currentId = parentById.get(currentId) || null;
    }

    return segments.join("/");
}

const getBlogIndex = cache(async (): Promise<BlogIndex> => {
    const pages = await queryAllDatasourcePages();
    const parentById = new Map<string, string | null>();
    const segmentById = new Map<string, string>();

    for (const page of pages) {
        parentById.set(page.id, getParentPageId(page));
        segmentById.set(page.id, pageSegmentSlug(page));
    }

    const byId = new Map<string, BlogPostSummary>();
    const bySlug = new Map<string, NotionPage>();

    for (const page of pages) {
        const slug = buildHierarchicalSlug(page.id, segmentById, parentById);
        byId.set(page.id, pageToSummary(page, slug));
        bySlug.set(slug, page);
    }

    const roots = [...byId.values()].filter((post) => !post.parentId);

    return { byId, bySlug, roots };
});

export async function getPage(pageId: string) {
    return await notion.pages.retrieve({ page_id: pageId });
}

export async function getBlockChildren(blockId: string, pageSize = 100) {
    const blocks: unknown[] = [];
    let cursor: string | undefined = undefined;

    do {
        const res = await notion.blocks.children.list({
            block_id: blockId,
            page_size: pageSize,
            start_cursor: cursor,
        });
        const typedRes = res as NotionQueryResponse;
        blocks.push(...typedRes.results);
        cursor = typedRes.next_cursor || undefined;
    } while (cursor);

    return blocks;
}

type NotionBlockWithChildren = {
    id: string;
    type: string;
    has_children?: boolean;
    children?: NotionBlockWithChildren[];
    [key: string]: unknown;
};

export async function getBlockTree(blockId: string, pageSize = 100): Promise<NotionBlockWithChildren[]> {
    const blocks = await getBlockChildren(blockId, pageSize);

    return Promise.all(
        blocks
            .filter((blockItem) => {
                const block = blockItem as NotionBlockWithChildren & { in_trash?: boolean; archived?: boolean };
                return !block.in_trash && !block.archived;
            })
            .map(async (blockItem) => {
            const block = blockItem as NotionBlockWithChildren;
            if (!block.has_children) {
                return block;
            }

            return {
                ...block,
                children: await getBlockTree(block.id, pageSize),
            };
        }),
    );
}

export async function queryBlogPosts() {
    const { roots } = await getBlogIndex();
    return roots;
}

export async function getChildBlogPosts(parentPageId: string) {
    const { byId } = await getBlogIndex();
    return [...byId.values()].filter((post) => post.parentId === parentPageId);
}

export async function getBlogPostBySlug(slug: string) {
    const normalizedSlug = normalizeSlug(slug);
    const { bySlug } = await getBlogIndex();
    const fromIndex = bySlug.get(normalizedSlug);
    if (fromIndex) {
        return fromIndex;
    }

    const datasourceId = process.env.NOTION_BLOG_DATASOURCE_ID;
    if (datasourceId) {
        const lastSegment = normalizedSlug.split("/").pop() || normalizedSlug;
        const response = await (notion as { dataSources: { query: (args: unknown) => Promise<unknown> } }).dataSources.query({
            data_source_id: datasourceId,
            filter: {
                or: [
                    {
                        property: "Slug",
                        rich_text: { equals: lastSegment },
                    },
                    {
                        property: "Title",
                        title: { equals: lastSegment },
                    },
                ],
            },
            page_size: 10,
        });
        const typedResponse = response as NotionQueryResponse;

        const result = typedResponse.results.find((page) => {
            const pageSlug = normalizeSlug(
                (getPropertyValue(page, "Slug") || getPropertyValue(page, "Path") || pageSegmentSlug(page) || "") as string,
            );
            return pageSlug === lastSegment || pageSlug === normalizedSlug;
        });

        if (result) {
            return result;
        }
    }

    const searchResponse = await notion.search({
        query: normalizedSlug,
        filter: { property: "object", value: "page" },
    });
    const typedSearch = searchResponse as NotionSearchResponse;

    return typedSearch.results.find((page) => {
        const pageSlug = normalizeSlug(
            (getPropertyValue(page, "Slug") || getPropertyValue(page, "Path") || pageSegmentSlug(page) || "") as string,
        );
        if (pageSlug === normalizedSlug) return true;
        const title = normalizeSlug((getPropertyValue(page, "Title") || "") as string);
        return title === normalizedSlug;
    });
}

export async function getBlogPageProps(pageId: string) {
    const page = await getPage(pageId);
    const blocks = await getBlockTree(pageId);
    const typedPage = page as NotionPage;
    const { byId } = await getBlogIndex();
    const summary = byId.get(pageId);

    return {
        page,
        blocks,
        title: (getPropertyValue(typedPage, "Title") || getPropertyValue(typedPage, "Name") || "Untitled") as string,
        excerpt: (getPropertyValue(typedPage, "Excerpt") as string) || "",
        date: (getPropertyValue(typedPage, "Published") as string) || (getPropertyValue(typedPage, "Date") as string) || null,
        tags: (getPropertyValue(typedPage, "Tags") as string[]) || [],
        slug: summary?.slug || pageSegmentSlug(typedPage),
    };
}

export type AlbumItem = {
    id: string;
    title: string;
    imageUrl: string;
    story: string;
};

function extractGoogleDriveFileId(url: string): string | null {
    // Match pattern: /d/FILE_ID/ or /id=FILE_ID
    const fileIdMatch = url.match(/(?:\/d\/|id=)([a-zA-Z0-9-_]+)/);
    return fileIdMatch ? fileIdMatch[1] : null;
}

function convertToDirectImageUrl(url: string): string {
    // Check if it's a Google Drive URL
    console.log(`Converting URL: "${url}"`);
    if (url.includes("drive.google.com")) {
        const fileId = extractGoogleDriveFileId(url);
        console.log(`Converting Google Drive URL. Original: "${url}", Extracted file ID: "${fileId}"`);
        if (fileId) {
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
    }
    // Return original URL if not a Google Drive URL or couldn't extract ID
    return url;
}

export async function getAlbumItems(): Promise<AlbumItem[]> {
    const albumDataSourceId = process.env.NOTION_ALBUM_DATASOURCE_ID || "375f2649-c68a-80ff-8cec-000b481bd05d";
    
    if (!albumDataSourceId) {
        return [];
    }

    const albumItems: AlbumItem[] = [];
    let cursor: string | undefined = undefined;

    try {
        do {
            const response = await (notion as { dataSources: { query: (args: unknown) => Promise<unknown> } }).dataSources.query({
                data_source_id: albumDataSourceId,
                start_cursor: cursor,
            });
            const typedResponse = response as unknown as NotionQueryResponse;

            for (const page of typedResponse.results) {
                const title = (getPropertyValue(page, "Title") || getPropertyValue(page, "Name") || "Untitled") as string;
                let imageUrl = (getURLProperty(page, "ImageURL") || getPropertyValue(page, "Image") || "") as string;
                // Convert Google Drive URLs to direct image URLs
                imageUrl = convertToDirectImageUrl(imageUrl);
                const story = (getPropertyValue(page, "Story") || getPropertyValue(page, "Description") || "") as string;
                console.log(`asdfadf page "${title}" (${page.id}): imageUrl="${imageUrl}", story="${story}"`);
                if (imageUrl) {
                    albumItems.push({
                        id: page.id,
                        title,
                        imageUrl,
                        story,
                    });
                }
            }

            cursor = typedResponse.next_cursor || undefined;
        } while (cursor);
        console.log("Fetched album items:", albumItems);
        return albumItems;
    } catch (error) {
        console.error("Error fetching album items:", error);
        return [];
    }
}
