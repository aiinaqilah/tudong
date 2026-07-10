import { getCurrentSession } from "@/actions/auth";

export default async function UserProfilePage() {
  const { user } = await getCurrentSession();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email.slice(0, 2).toUpperCase() ?? "??";

  const joinedDate = (user as { createdAt?: string | Date } | null)?.createdAt
    ? new Date((user as { createdAt: string | Date }).createdAt).toLocaleDateString("en-MY", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
          Dashboard
        </p>
        <h1 className="text-2xl font-bold font-heading text-gray-900">My Profile</h1>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Avatar section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user?.name ?? "User"}</h2>
            <p className="text-gray-300 text-sm">{user?.email}</p>
            {joinedDate && (
              <p className="text-gray-500 text-xs mt-1">Member since {joinedDate}</p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-gray-100">
          <ProfileRow label="Full Name" value={user?.name ?? "—"} />
          <ProfileRow label="Email Address" value={user?.email ?? "—"} />
          <ProfileRow
            label="Account Role"
            value={
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                {(user as { role?: string })?.role ?? "user"}
              </span>
            }
          />
          {joinedDate && <ProfileRow label="Member Since" value={joinedDate} />}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 shrink-0">
        {label}
      </p>
      <div className="text-sm font-medium text-gray-900 text-right">{value}</div>
    </div>
  );
}
