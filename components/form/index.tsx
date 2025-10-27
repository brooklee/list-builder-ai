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
        checked?: boolean;
    };

    type HomeDepotResult = {
        title: string;
        link: string;
        thumbnail?: string | null;
        price?: string;
    };

    const [buildPlan, setBuildPlan] = useState("");
    // const [materials, setMaterials] = useState([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [homeDepotSearch, setHomeDepotSearch] = useState<HomeDepotResult[]>([]);

    const handleSubmit = async () => {
        if (!buildPlan.trim()) {
            setMaterials([]);
            return;
        }
        try {
            const res = await fetch("/api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buildPlan }),
            });

            const text = await res.text();
            console.log("/api response:", text);
            if (!res.ok) {
                throw new Error(text || `HTTP ${res.status}`);
            }
            const data: Material[] = text ? JSON.parse(text) : [];
            setMaterials(data.map(m => ({ ...m, checked: m.checked ?? false })));
        } catch (err) {
            console.error("Failed to fetch materials:", err);
            setMaterials([]);
        }
    };

    const handleHomeDepotSearch = async () => {
       try {
         const res = await fetch("/api/home-depot", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             parsedItems: materials.filter(m => !m.checked).map(m => `${m.quantity} ${m.item} ${m.details ?? ""}`.trim()),
             storeZip: "84074",
             storeId: "4419",
           }),
         });
         const text = await res.text();
         if (!res.ok) {
           throw new Error(text || `HTTP ${res.status}`);
         }
         const data = text ? JSON.parse(text) : [];
         console.log("Home Depot Search Response:", data);

         const flattened: HomeDepotResult[] = (Array.isArray(data) ? data : [])
           .map((entry: any) => {
             const products = Array.isArray(entry?.products) ? entry.products : [];
             const first = products[0];
             if (!first) return null;

             const title: string | undefined = first?.title;
             const link: string | undefined = first?.link;
             const price: string | undefined = first?.price;
             const thumbnail: string | null =
               (typeof first?.thumbnail === "string" && first.thumbnail) ||
               (typeof first?.image === "string" && first.image) ||
               (Array.isArray(first?.images) && first.images.length > 0 && first.images[0]) ||
               (Array.isArray(first?.thumbnails) && first.thumbnails.length > 0 && first.thumbnails[0]) ||
               null;

             if (!title || !link) return null;
             return { title, link, thumbnail, price } as HomeDepotResult;
           })
           .filter(Boolean) as HomeDepotResult[];

         setHomeDepotSearch(flattened);
       } catch (err) {
         console.error("Home Depot search failed:", err);
       }
    };
  return (
    <>
        <h3 className="text-lg font-bold">Step 1</h3>
        <p className="text-md text-gray-500 max-w-[600px]">Paste or upload your build plan or list of items here and we will use ai to generate a list of items.</p>
        <form className="flex flex-col gap-[16px]" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <textarea placeholder="Paste your list here" className="w-full h-[200px] min-w-[600px] border border-gray-300 rounded-md p-2" value={buildPlan} onChange={(e) => setBuildPlan(e.target.value)} />
        {/* <input className="w-full h-[100px] min-w-[600px] border border-gray-300 border-dashed rounded-md p-2" type="file" id="plan-file" name="plan-file" />     */}
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Upload file</label>
        <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file"/>


        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 hover:cursor-pointer">Get List</button>
        </form>
        <hr className="w-full border-gray-200" />
        <h3 className="text-lg font-bold">Step 2</h3>
        <p className="text-md text-gray-500 max-w-[600px]">check off items you dont need and we will remove them from the list from home depot.</p>

        <ul>
        {materials.map((item, i) => (
            <li key={i}>
            <input id={`checkbox-${i}`} type="checkbox" checked={!!item.checked} onChange={(e) => setMaterials(materials.map((m, index) => index === i ? { ...m, checked: e.target.checked } : m))} />
            <label className={`ml-2 ${item.checked ? "line-through text-gray-400" : ""}`} htmlFor={`checkbox-${i}`}>
              {item.quantity} x {item.item} <span className="text-gray-500">details: {item.length || item.details || ""}</span>
            </label>
            </li>
        ))}
        </ul>

        <hr className="w-full border-gray-200" />
       

        {materials.length === 0 && (
            <p className="text-sm text-gray-500">No items parsed yet.</p>
        )}

        <hr className="w-full border-gray-200" />
        <h3 className="text-lg font-bold">Step 3</h3>
        <p className="text-md text-gray-500 max-w-[600px]">We will get a price list and total cost of your project from Home Depot.</p>
        <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 hover:cursor-pointer" onClick={handleHomeDepotSearch}>Search Home Depot</button>
        <p className="text-sm text-gray-500">Found {homeDepotSearch.length} items</p>
        <ul className="mt-4 flex flex-col gap-2">
            {homeDepotSearch.map((p, i) => (
                <li key={i} className="flex items-center gap-3">
                    {p.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.thumbnail[0]} alt={p.title} className="h-12 w-12 object-contain rounded" />
                    ) : null}
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {p.title}
                    </a>
                    <p className="text-sm text-gray-500">{p.price == null ? "No price available" : `$ ${p.price}`}</p>
                </li>
            ))}

            <h3 className="text-lg font-bold mt-4 text-center">Total: ${homeDepotSearch.reduce((acc, p) => acc + (p.price ? parseFloat(p.price) : 0), 0)}</h3>
        </ul>

        {/* <Table materials={materials} /> */}
    </>
  );
}