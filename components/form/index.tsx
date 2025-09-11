import { useState } from "react";
import Table from "../table";

export default function Form() {

    type Material = {
        item: string;
        quantity: number;
        price?: number;
        total?: number;
        length?: string | number;
        details?: string;
    };

    const [buildPlan, setBuildPlan] = useState("");
    // const [materials, setMaterials] = useState([]);
    const [materials, setMaterials] = useState<Material[]>([]);

    const handleSubmit = async () => {
        try {
            const res = await fetch("/api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buildPlan }),
            });

            const text = await res.text();
            if (!res.ok) {
                throw new Error(text || `HTTP ${res.status}`);
            }
            const data: Material[] = text ? JSON.parse(text) : [];
            setMaterials(data);
        } catch (err) {
            console.error("Failed to fetch materials:", err);
            setMaterials([]);
        }
    };
  return (
    <>
        <p className="text-md text-gray-500 max-w-[600px]">Paste your build plan or list of items here and we will use ai to get a create a shopping list with a cost break down from Home Depot.</p>
        <form className="flex flex-col gap-[16px]" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <textarea placeholder="Paste your list here" className="w-full h-[200px] min-w-[600px] border border-gray-300 rounded-md p-2" value={buildPlan} onChange={(e) => setBuildPlan(e.target.value)} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 hover:cursor-pointer">Get List</button>
        </form>

        <ul>
        {materials.map((item, i) => (
            <li key={i}>
            {item.quantity} x {item.item} {item.length || item.details || ""}
            </li>
        ))}
        </ul>
        {/* <Table materials={materials} /> */}
    </>
  );
}