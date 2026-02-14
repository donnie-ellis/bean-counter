// ./app/budget/tags/page.tsx
import TagManager from "@/app/tags/_components/tagManager";
import { getTags } from "./actions";

export default async function Tags() {
    const tags = await getTags();
    return (
        <TagManager tags={tags} />
    )
}
