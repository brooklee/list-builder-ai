
export default function Table({ materials }: { materials: any }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {materials.map((material: any) => (
        <tr key={material.item}>
          <td>{material.item}</td>
          <td>{material.quantity}</td>
          <td>{material.price}</td>
          <td>{material.total}</td>
        </tr>
        ))}
      </tbody>
    </table>
  );
}