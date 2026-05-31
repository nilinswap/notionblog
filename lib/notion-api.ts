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

function getPropertyValue(page: NotionPage, propertyName: string) {
    const property = page.properties?.[propertyName] as NotionProperty | undefined;
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
        default:
            return null;
    }
}

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

export async function queryBlogPosts() {
    const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
    const dataSourceId = process.env.NOTION_BLOG_DATASOURCE_ID;
    if (!databaseId) {
        return [];
    }

    // const response = await notion.databases.query({
    //     database_id: databaseId,
    //     sorts: [
    //         {
    //             property: "published",
    //             direction: "descending",
    //         },
    //     ],
    // });
    console.log("Querying Notion data source with ID:", dataSourceId);
    const response = await notion.dataSources.query({
        data_source_id: dataSourceId!,
        // filter: {
        //     property: "Status",
        //     select: { equals: "Done" }
        // },
        // sorts: [
        //     {
        //         property: "Created",
        //         direction: "descending"
        //     }
        // ]
    })
    const typedResponse = response as unknown as NotionQueryResponse;

    return typedResponse.results.map((page) => ({
        id: page.id,
        title: (getPropertyValue(page, "Title") || getPropertyValue(page, "Name") || "Untitled") as string,
        slug:
            normalizeSlug(
                (getPropertyValue(page, "Slug") || getPropertyValue(page, "Path") || getPropertyValue(page, "Title") || "") as string,
            ) || page.id,
        excerpt: (getPropertyValue(page, "Excerpt") as string) || "",
        date: (getPropertyValue(page, "Published") as string) || (getPropertyValue(page, "Date") as string) || null,
        tags: (getPropertyValue(page, "Tags") as string[]) || [],
    }));
}

export async function getBlogPostBySlug(slug: string) {
    console.log("Looking for blog post with slug:", slug);
    const datasourceId = process.env.NOTION_BLOG_DATASOURCE_ID;
    const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
    if (databaseId) {
        const response = await (notion as any).dataSources.query({
            data_source_id: datasourceId!,
            filter: {
                or: [
                    {
                        property: "Slug",
                        rich_text: { equals: slug },
                    },
                    {
                        property: "Title",
                        title: { equals: slug },
                    },
                ],
            },
            page_size: 10,
        });
        const typedResponse = response as unknown as NotionQueryResponse;

        const result = typedResponse.results.find((page) => {
            const pageSlug = normalizeSlug(
                (getPropertyValue(page, "Slug") || getPropertyValue(page, "Path") || getPropertyValue(page, "Title") || "") as string,
            );
            return pageSlug === slug;
        });

        console.log("Queried Notion data source for slug:", slug, "Found page:", result ? getPropertyValue(result, "Title") : "None");

        if (result) {
            return result;
        }
    }

    const searchResponse = await notion.search({
        query: slug,
        filter: { property: "object", value: "page" },
    });
    const typedSearch = searchResponse as NotionSearchResponse;

    return typedSearch.results.find((page) => {
        const pageSlug = normalizeSlug(
            (getPropertyValue(page, "Slug") || getPropertyValue(page, "Path") || getPropertyValue(page, "Title") || "") as string,
        );
        if (pageSlug === slug) return true;
        const title = normalizeSlug((getPropertyValue(page, "Title") || "") as string);
        return title === slug;
    });
}

export async function getBlogPageProps(pageId: string) {
    const page = await getPage(pageId);
    const blocks = await getBlockChildren(pageId);
    const typedPage = page as NotionPage;

    return {
        page,
        blocks,
        title: (getPropertyValue(typedPage, "Title") || getPropertyValue(typedPage, "Name") || "Untitled") as string,
        excerpt: (getPropertyValue(typedPage, "Excerpt") as string) || "",
        date: (getPropertyValue(typedPage, "Published") as string) || (getPropertyValue(typedPage, "Date") as string) || null,
        tags: (getPropertyValue(typedPage, "Tags") as string[]) || [],
    };
}
