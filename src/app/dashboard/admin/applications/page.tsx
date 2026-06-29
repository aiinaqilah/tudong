import { getAllApplications, approveApplication, rejectApplication } from "@/actions/seller-application-actions";

export default async function AdminApplicationsPage() {
  const applications = await getAllApplications();

  const pending = applications.filter((a) => a.status === "PENDING");
  const reviewed = applications.filter((a) => a.status !== "PENDING");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Seller Applications</h1>

      {applications.length === 0 && (
        <p className="text-gray-500 text-sm">No applications yet.</p>
      )}

      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Pending ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Reviewed ({reviewed.length})
          </h2>
          <div className="space-y-4">
            {reviewed.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ApplicationCard({
  app,
}: {
  app: Awaited<ReturnType<typeof getAllApplications>>[number];
}) {
  const isPending = app.status === "PENDING";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900">{app.brandName}</p>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-xs text-gray-500">
            {app.user.name ?? "—"} · {app.user.email}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Applied {new Date(app.createdAt).toLocaleDateString("en-MY", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {isPending && (
          <div className="flex gap-2 shrink-0">
            <form action={approveApplication.bind(null, app.id)}>
              <button
                type="submit"
                className="px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-full hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
            </form>
            <form action={rejectApplication.bind(null, app.id)}>
              <button
                type="submit"
                className="px-4 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full hover:bg-red-200 transition-colors"
              >
                Reject
              </button>
            </form>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-700 mt-3 leading-relaxed">{app.description}</p>

      {(app.instagram || app.website) && (
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          {app.instagram && <span>Instagram: @{app.instagram}</span>}
          {app.website && (
            <a
              href={app.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {app.website}
            </a>
          )}
        </div>
      )}

      {/* User ID for admin to copy when setting up the brand in Sanity */}
      <p className="mt-3 text-[10px] text-gray-300 font-mono">
        User ID: {app.user.id}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
