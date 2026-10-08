import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";

function DonationHistory() {
  const [params, setParams] = useSearchParams();
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function getHistory() {
    const gifts = await supabase
      .from("donations")
      .select("*, donors(name, email), campaigns(title)")
      .order("donation_date", { ascending: false })
      .order("id", { ascending: false });
    const people = await supabase
      .from("donors")
      .select("id, name")
      .order("name");
    if (gifts.error || people.error)
      setError((gifts.error || people.error).message);
    else {
      setDonations(gifts.data);
      setDonors(people.data);
    }
    setLoading(false);
  }
  useEffect(() => {
    // The state updates happen after the asynchronous Supabase requests finish.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getHistory();
  }, []);

  async function markReceived(id) {
    setSavingId(id);
    setError("");
    setMessage("");
    const { error: updateError } = await supabase
      .from("donations")
      .update({ status: "Completed" })
      .eq("id", id)
      .select()
      .single();
    if (updateError) setError(updateError.message);
    else {
      setMessage("Payment marked as received in Supabase.");
      await getHistory();
    }
    setSavingId(null);
  }
  const donorId = params.get("donor") || "";
  const filtered = donations.filter(
    (donation) =>
      (!donorId || String(donation.donor_id) === donorId) &&
      `${donation.donors?.name} ${donation.campaigns?.title} ${donation.payment_method} ${donation.status}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const received = filtered
    .filter((donation) => donation.status === "Completed")
    .reduce((sum, donation) => sum + Number(donation.amount), 0);
  const pending = filtered
    .filter((donation) => donation.status === "Pending")
    .reduce((sum, donation) => sum + Number(donation.amount), 0);
  return (
    <main className="page inner-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">EVERY GIFT HAS A STORY</span>
          <h1>
            A record of <span>real impact.</span>
          </h1>
          <p>Every donor. Every campaign. Every contribution, together.</p>
        </div>
        <Link className="button" to="/donate">
          ＋ Record donation
        </Link>
      </div>
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="message success" role="status">
          {message}
        </p>
      )}
      <section className="history-stats">
        <div>
          <span>CONTRIBUTIONS</span>
          <strong>{filtered.length}</strong>
        </div>
        <div>
          <span>AMOUNT RECEIVED</span>
          <strong className="mint-text">
            ₹{received.toLocaleString("en-IN")}
          </strong>
        </div>
        <div>
          <span>PAYMENTS PENDING</span>
          <strong>₹{pending.toLocaleString("en-IN")}</strong>
        </div>
      </section>
      <div className="list-toolbar history-toolbar">
        <label className="filter-label">
          Donor
          <select
            value={donorId}
            onChange={(event) =>
              setParams(event.target.value ? { donor: event.target.value } : {})
            }
          >
            <option value="">All donors</option>
            {donors.map((donor) => (
              <option value={donor.id} key={donor.id}>
                {donor.name}
              </option>
            ))}
          </select>
        </label>
        <input
          className="search-input"
          aria-label="Search contributions"
          placeholder="Search contributions…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Donor / receipt</th>
              <th>Campaign</th>
              <th>Date</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((donation) => (
              <tr key={donation.id}>
                <td>
                  <strong>{donation.donors?.name || "Unknown donor"}</strong>
                  <small>GF-{String(donation.id).padStart(4, "0")}</small>
                </td>
                <td>
                  {donation.campaigns?.title || "Unknown campaign"}
                  {donation.notes && (
                    <small className="record-note">{donation.notes}</small>
                  )}
                </td>
                <td className="nowrap">
                  {new Date(
                    donation.donation_date + "T12:00:00",
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td>{donation.payment_method}</td>
                <td className="amount-cell">
                  ₹{Number(donation.amount).toLocaleString("en-IN")}
                </td>
                <td>
                  <span
                    className={`status-badge ${donation.status === "Pending" ? "pending" : ""}`}
                  >
                    {donation.status === "Completed"
                      ? "● Received"
                      : "◷ Pending"}
                  </span>
                  {donation.status === "Pending" && (
                    <button
                      className="receive-button"
                      disabled={savingId !== null}
                      onClick={() => markReceived(donation.id)}
                    >
                      {savingId === donation.id ? "Saving…" : "Mark received"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="empty-state">Loading contribution history…</div>
        )}
        {!loading && !filtered.length && (
          <div className="empty-state">No contributions found.</div>
        )}
        <div className="table-footer">
          <span>{filtered.length} contributions shown</span>
          <span>Saved in Supabase · refresh to see external changes</span>
        </div>
      </div>
    </main>
  );
}
export default DonationHistory;
