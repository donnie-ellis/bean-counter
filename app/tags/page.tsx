// ./app/budget/tags/page.tsx
import TagManager from "@/components/tagManager";
import { getTags } from "./actions";

export default async function Tags() {
    const tags = await getTags();
    return (
        <TagManager tags={tags} />
    )
}
