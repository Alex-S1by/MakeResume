export default function Card({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition hover:scale-105 cursor-pointer">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}