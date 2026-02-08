import CardholderManager from "@/components/cardHolderManager";
import { getCardholders } from "./actions";
import { getUserProfiles } from "@/app/admin/users/actions";

export default async function CardHolder() {
    const cardholders = await getCardholders();
    const profiles = await getUserProfiles();

    if (!cardholders || !profiles) {
        return <div>Error loading data.</div>
    }

    return (
        <CardholderManager cardholders={cardholders} profiles={profiles} />
    )
}