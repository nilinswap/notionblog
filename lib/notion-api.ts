import { cache } from "react";
import crypto from "crypto";
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
    | { type: "status"; status?: { name?: string } }
    | { type: "date"; date?: { start?: string } }
    | { type: "formula"; formula?: { string?: string; number?: number } }
    | { type: "relation"; relation?: Array<{ id?: string }> }
    | { type: "url"; url?: string | null }
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
    status: string | null;
    isDraft: boolean;
    previewToken: string;
};

type BlogIndex = {
    byId: Map<string, BlogPostSummary>;
    bySlug: Map<string, NotionPage>;
    roots: BlogPostSummary[];
    draftRoots: BlogPostSummary[];
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
    return (property as { url?: string | null }).url || null;
}

function getPropertyValue(page: NotionPage, propertyName: string) {
    if (!page.properties) return null;
    let property = page.properties[propertyName] as NotionProperty | undefined;
    if (!property) {
        const lower = propertyName.toLowerCase();
        const foundKey = Object.keys(page.properties).find((k) => k.toLowerCase() === lower);
        if (foundKey) {
            property = page.properties[foundKey] as NotionProperty | undefined;
        }
    }
    if (!property || typeof property !== "object") return null;

    switch (property.type) {
        case "title":
            return richTextToString(property.title);

        case "rich_text":
            return richTextToString(property.rich_text);
        case "select":
            return (property as { select?: { name?: string } }).select?.name || null;
        case "status":
            return (property as { status?: { name?: string } }).status?.name || null;
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

export function isPostPublished(page: NotionPage): boolean {
    const status = getPropertyValue(page, "Status");
    return typeof status === "string" && status.trim().toLowerCase() === "published";
}

export function isPostDraft(page: NotionPage): boolean {
    return !isPostPublished(page);
}

export function getCustomPreviewToken(page: NotionPage): string | null {
    const customProps = [
        "Preview Token",
        "PreviewToken",
        "Draft Token",
        "DraftToken",
        "Secret",
        "Share Key",
        "ShareKey",
        "Preview Key",
        "PreviewKey",
        "Token",
    ];
    for (const propName of customProps) {
        const val = getPropertyValue(page, propName);
        if (typeof val === "string" && val.trim().length > 0) {
            return val.trim();
        }
    }
    return null;
}

export function getGeneratedPreviewToken(pageId: string): string {
    const cleanId = pageId.replace(/-/g, "").toLowerCase();
    const secret =
        process.env.DRAFT_SECRET ||
        process.env.BLOG_PREVIEW_SECRET ||
        process.env.NOTION_ACCESS_TOKEN ||
        process.env.NOTION_BLOG_DATASOURCE_ID ||
        "notionblog-draft-salt";
    return crypto.createHmac("sha256", secret).update(cleanId).digest("hex").slice(0, 16);
}

export function getDraftPreviewToken(pageId: string, page?: NotionPage): string {
    if (page) {
        const custom = getCustomPreviewToken(page);
        if (custom) return custom;
    }
    return getGeneratedPreviewToken(pageId);
}

export function isDraftTokenValid(page: NotionPage, tokenToCheck: string | null | undefined): boolean {
    if (!tokenToCheck || typeof tokenToCheck !== "string") {
        return false;
    }
    const token = tokenToCheck.trim();
    if (!token) return false;

    // 1. Check custom token from Notion properties if present
    const customToken = getCustomPreviewToken(page);
    if (customToken && customToken.toLowerCase() === token.toLowerCase()) {
        return true;
    }

    // 2. Check generated deterministic HMAC token
    const generatedToken = getGeneratedPreviewToken(page.id);
    if (generatedToken.toLowerCase() === token.toLowerCase()) {
        return true;
    }

    // 3. Check Notion Page ID (with or without dashes)
    const cleanPageId = page.id.replace(/-/g, "").toLowerCase();
    const cleanInput = token.replace(/-/g, "").toLowerCase();
    if (cleanInput === cleanPageId) {
        return true;
    }

    // 4. Check global/master secret from environment variables if configured
    const masterSecret = process.env.DRAFT_SECRET || process.env.BLOG_PREVIEW_SECRET;
    if (masterSecret && token === masterSecret) {
        return true;
    }

    return false;
}

export function isPostAllowed(page: NotionPage, tokenToCheck?: string | null): boolean {
    if (isPostPublished(page)) {
        return true;
    }
    if (tokenToCheck && isDraftTokenValid(page, tokenToCheck)) {
        return true;
    }
    return false;
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
    const isDraft = isPostDraft(page);
    return {
        id: page.id,
        title: (getPropertyValue(page, "Title") || getPropertyValue(page, "Name") || "Untitled") as string,
        slug,
        segmentSlug: pageSegmentSlug(page),
        excerpt: (getPropertyValue(page, "Excerpt") as string) || "",
        date: (getPropertyValue(page, "Published") as string) || (getPropertyValue(page, "Date") as string) || null,
        tags: (getPropertyValue(page, "Tags") as string[]) || [],
        parentId: getParentPageId(page),
        status: (getPropertyValue(page, "Status") as string) || null,
        isDraft,
        previewToken: getDraftPreviewToken(page.id, page),
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

    // Only published top-level posts appear in the public listing
    const roots = [...byId.values()].filter((post) => !post.parentId && !post.isDraft);
    // Draft top-level posts (for private author preview)
    const draftRoots = [...byId.values()].filter((post) => !post.parentId && post.isDraft);

    return { byId, bySlug, roots, draftRoots };
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

export async function queryDraftBlogPosts() {
    const { draftRoots } = await getBlogIndex();
    return draftRoots;
}

export async function getChildBlogPosts(parentPageId: string, previewToken?: string | null) {
    const { byId } = await getBlogIndex();
    const masterSecret = process.env.DRAFT_SECRET || process.env.BLOG_PREVIEW_SECRET;
    return [...byId.values()].filter((post) => {
        if (post.parentId !== parentPageId) return false;
        if (!post.isDraft) return true;
        if (previewToken && (post.previewToken === previewToken || (masterSecret && previewToken === masterSecret))) {
            return true;
        }
        return false;
    });
}

export async function getBlogPostBySlug(slug: string, previewToken?: string | null) {
    const normalizedSlug = normalizeSlug(slug);
    const { bySlug } = await getBlogIndex();
    const fromIndex = bySlug.get(normalizedSlug);
    if (fromIndex) {
        if (isPostAllowed(fromIndex, previewToken)) {
            return fromIndex;
        }
        return null;
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
            return (pageSlug === lastSegment || pageSlug === normalizedSlug);
        });

        if (result) {
            if (isPostAllowed(result, previewToken)) {
                return result;
            }
            return null;
        }
    }

    const searchResponse = await notion.search({
        query: normalizedSlug,
        filter: { property: "object", value: "page" },
    });
    const typedSearch = searchResponse as NotionSearchResponse;

    const found = typedSearch.results.find((page) => {
        const pageSlug = normalizeSlug(
            (getPropertyValue(page, "Slug") || getPropertyValue(page, "Path") || pageSegmentSlug(page) || "") as string,
        );
        if (pageSlug === normalizedSlug) return true;
        const title = normalizeSlug((getPropertyValue(page, "Title") || "") as string);
        return title === normalizedSlug;
    });

    if (found && isPostAllowed(found, previewToken)) {
        return found;
    }

    return null;
}

export async function getBlogPageProps(pageId: string) {
    const page = await getPage(pageId);
    const blocks = await getBlockTree(pageId);
    const typedPage = page as NotionPage;
    const { byId } = await getBlogIndex();
    const summary = byId.get(pageId);

    const isDraft = isPostDraft(typedPage);
    const previewToken = getDraftPreviewToken(pageId, typedPage);

    return {
        page,
        blocks,
        title: (getPropertyValue(typedPage, "Title") || getPropertyValue(typedPage, "Name") || "Untitled") as string,
        excerpt: (getPropertyValue(typedPage, "Excerpt") as string) || "",
        date: (getPropertyValue(typedPage, "Published") as string) || (getPropertyValue(typedPage, "Date") as string) || null,
        tags: (getPropertyValue(typedPage, "Tags") as string[]) || [],
        slug: summary?.slug || pageSegmentSlug(typedPage),
        status: (getPropertyValue(typedPage, "Status") as string) || null,
        isDraft,
        previewToken,
    };
}

export type SubItem = {
    imageUrl: string;
    title: string;
    story: string;
    date?: string;
};

export type AlbumItem = {
    id: string;
    title: string;
    imageUrl: string;
    story: string;
    date?: string;
    images: string[];
    subitems?: SubItem[];
    parentId?: string | null;
};

function extractGoogleDriveFileId(url: string): string | null {
    // Match pattern: /d/FILE_ID/ or /id=FILE_ID
    const fileIdMatch = url.match(/(?:\/d\/|id=)([a-zA-Z0-9-_]+)/);
    return fileIdMatch ? fileIdMatch[1] : null;
}

async function resolveGooglePhotosImageUrl(shareUrl: string): Promise<string | null> {
    try {
        const response = await fetch(shareUrl, {
            redirect: "follow",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });

        const html = await response.text();

        // Find lh3.googleusercontent.com URLs embedded in the page
        const matches = html.match(/https:\/\/lh3\.googleusercontent\.com\/[^\\"'<>\s]+/g);

        if (!matches?.length) {
            return null;
        }

        // Use the first match and normalize to original size
        const url = matches[0];
        return url.replace(/=w\d+(-h\d+)?(-[^?]*)?(\?.*)?$/, "=s0");
    } catch (error) {
        console.error("Error resolving Google Photos URL:", error);
        return null;
    }
}

async function convertToDirectImageUrl(url: string): Promise<string> {
    // Check if it's a Google Drive URL
    if (url.includes("drive.google.com")) {
        const fileId = extractGoogleDriveFileId(url);
        console.log(`Extracted file ID from Google Drive URL "${url}":`, fileId);
        if (fileId) {
            console.log(`Converted Google Drive URL "${url}" to direct image URL:`, `https://drive.google.com/uc?export=download&id=${fileId}`);
            return Promise.resolve(`https://drive.google.com/uc?export=download&id=${fileId}`);
        }
    }

    // Check if it's a Google Photos share URL
    if (url.includes("photos.app.goo.gl")) {
        const resolvedUrl = await resolveGooglePhotosImageUrl(url);
        if (resolvedUrl) {
            return resolvedUrl;
        }
    }

    // Return original URL if not a recognized format or couldn't resolve
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
                imageUrl = await convertToDirectImageUrl(imageUrl);
                const story = (getPropertyValue(page, "Story") || getPropertyValue(page, "Description") || "") as string;
                const date = (getPropertyValue(page, "Date") || getPropertyValue(page, "Published") || "") as string;
                const parentId = getParentPageId(page);
                console.log(`asdfadf page "${title}" (${page.id}): imageUrl="${imageUrl}", story="${story}", date="${date}", parentId="${parentId}"`);
                if (imageUrl) {
                    albumItems.push({
                        id: page.id,
                        title,
                        imageUrl,
                        story,
                        date,
                        parentId,
                        images: [imageUrl],
                    });
                }
            }

            cursor = typedResponse.next_cursor || undefined;
        } while (cursor);
        console.log("Fetched raw album items:", albumItems);

        // Group child items into their parents
        const parents = albumItems.filter((item) => !item.parentId);
        const children = albumItems.filter((item) => item.parentId);

        const fullyMappedAlbums: AlbumItem[] = parents.map((parent) => {
            const childItems = children
                .filter((child) => child.parentId === parent.id);

            const subitems: SubItem[] = [
                {
                    imageUrl: parent.imageUrl,
                    title: parent.title,
                    story: parent.story,
                    date: parent.date,
                },
                ...childItems.map((child) => ({
                    imageUrl: child.imageUrl,
                    title: child.title,
                    story: child.story,
                    date: child.date,
                })),
            ];

            return {
                id: parent.id,
                title: parent.title,
                imageUrl: parent.imageUrl,
                story: parent.story,
                date: parent.date,
                images: subitems.map((item) => item.imageUrl),
                subitems,
            };
        });

        console.log("Grouped album items:", fullyMappedAlbums);
        return fullyMappedAlbums;
    } catch (error) {
        console.error("Error fetching album items:", error);
        return [];
    }
}

export async function getTILPage() {
    const dataSourceId = process.env.NOTION_BLOG_DATASOURCE_ID;
    if (dataSourceId) {
        let cursor: string | undefined = undefined;
        do {
            const response = await notion.dataSources.query({
                data_source_id: dataSourceId,
                start_cursor: cursor,
            });
            const typedResponse = response as unknown as NotionQueryResponse;
            const found = typedResponse.results.find((page) => {
                const slug = (getPropertyValue(page, "Slug") || getPropertyValue(page, "Path") || "") as string;
                const normalizedSlug = normalizeSlug(slug);
                const title = (getPropertyValue(page, "Title") || getPropertyValue(page, "Name") || "") as string;
                return normalizedSlug === "til" || normalizeSlug(title) === "til";
            });
            if (found) return found;
            cursor = typedResponse.next_cursor || undefined;
        } while (cursor);
    }

    const searchResponse = await notion.search({
        query: "til",
        filter: { property: "object", value: "page" },
    });
    const typedSearch = searchResponse as NotionSearchResponse;
    return typedSearch.results.find((page) => {
        const slug = (getPropertyValue(page, "Slug") || getPropertyValue(page, "Path") || "") as string;
        const title = (getPropertyValue(page, "Title") || getPropertyValue(page, "Name") || "") as string;
        return normalizeSlug(slug) === "til" || normalizeSlug(title) === "til";
    });
}

