import { getTILPage, getBlockTree } from "@/lib/notion-api";
import BlogContainer from "@/app/blog/blog-container";
import Link from "next/link";
import TILContainer from "./til-container";

export const dynamic = "force-dynamic";

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  [key: string]: unknown;
};

type TILEntry = {
  id: string;
  text: string;
  day: string;
  month: string;
  year: string;
};

function getBlockText(block: NotionBlock): string {
  const value = block[block.type] as Record<string, unknown> | undefined;
  if (value && Array.isArray(value.rich_text)) {
    return value.rich_text.map((fragment: { plain_text?: string }) => fragment.plain_text || "").join("");
  }
  return "";
}

export default async function TILPage() {
  const page = await getTILPage();

  if (!page) {
    return (
      <BlogContainer>
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-bold text-slate-900">TIL Page Not Found</h1>
          <p className="text-slate-600">
            We could not find the Notion page with the slug or title <span className="font-semibold">&quot;til&quot;</span> in the database.
          </p>
          <Link href="/blog" className="inline-flex rounded-full bg-orange-500 px-5 py-3 text-white hover:bg-orange-600">
            Back to blog listing
          </Link>
        </div>
      </BlogContainer>
    );
  }

  const blockTree = await getBlockTree(page.id);
  const entries: TILEntry[] = [];

  // Parse Year -> Month -> Day -> Entry
  for (const yearBlock of blockTree) {
    const yearText = getBlockText(yearBlock).trim();
    if (/^\d{4}$/.test(yearText)) {
      const year = yearText;
      if (yearBlock.children) {
        for (const monthBlock of yearBlock.children) {
          const monthText = getBlockText(monthBlock).trim();
          if (monthText) {
            const month = monthText;
            if (monthBlock.children) {
              for (const dayBlock of monthBlock.children) {
                const dayText = getBlockText(dayBlock).trim();
                if (/^\d{1,2}$/.test(dayText)) {
                  const day = dayText;
                  if (dayBlock.children) {
                    for (const entryBlock of dayBlock.children) {
                      const entryText = getBlockText(entryBlock).trim();
                      if (entryText) {
                        entries.push({
                          id: entryBlock.id,
                          text: entryText,
                          day,
                          month,
                          year,
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return <TILContainer initialEntries={entries} />;
}
