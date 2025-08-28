export default function Customers() {
  const customers = [
    { id: 1, name: "Ali Khan", email: "ali@example.com", phone: "0301-1234567" },
    { id: 2, name: "Sara Ahmed", email: "sara@example.com", phone: "0321-9876543" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-400 via-gray-900 to-black text-white p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Customers</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg 
                       hover:scale-105 hover:shadow-2xl transition-transform duration-300"
          >
            <h3 className="text-lg font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-300">{c.email}</p>
            <p className="text-sm text-gray-400">{c.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
