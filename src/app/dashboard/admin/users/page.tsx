import { getAllUsers, updateUserRole } from "@/actions/admin-actions";

const ROLES = ["customer", "seller", "admin"] as const;

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2 pr-4">Joined</th>
              <th className="pb-2">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium">{user.name ?? "—"}</td>
                <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                <td className="py-3 pr-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <form action={updateUserRole.bind(null, user.id)}>
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="text-xs border border-gray-300 rounded px-2 py-1 mr-2"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <button type="submit" className="text-xs underline text-gray-700">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    seller: "bg-blue-100 text-blue-800",
    customer: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[role] ?? "bg-gray-100 text-gray-700"}`}>
      {role}
    </span>
  );
}
