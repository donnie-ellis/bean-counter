// ./app/cardholder/page.tsx

import { CardholderManager } from "@/components/cardHolderManager";
import { getCardholders, deleteCardholder, updateCardholder, createCardholder } from "./actions";

export default async function CardHolder() {
    return (
        <CardholderManager onDelete={deleteCardholder} onUpdate={updateCardholder} onCreate={createCardholder} />
    )
}