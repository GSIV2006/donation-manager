import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

function Donors() {
  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function getDonors() {
    const people = await supabase.from("donors").select("*").order("name");
    const gifts = await supabase
      .from("donations")
      .select("donor_id, amount, status");
    if (people.error || gifts.error)
      setError((people.error || gifts.error).message);
    else {
      setDonors(people.data);
      setDonations(gifts.data);
    }
    setLoading(false);
  }
  useEffect(() => {
    // The state updates happen after the asynchronous Supabase requests finish.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getDonors();
  }, []);

  async function saveDonor(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!name.trim()) {
      setError("Please enter a donor name.");
      return;
    }
    setSaving(true);
    const values = { name: name.trim(), email: email.trim() };
    const result = editingId
      ? await supabase
          .from("donors")
          .update(values)
          .eq("id", editingId)
          .select()
          .single()
      : await supabase.from("donors").insert(values).select().single();
    if (result.error) setError(result.error.message);
    else {
      setMessage("Donor saved to Supabase.");
      setShowForm(false);
      setName("");
      setEmail("");
      setEditingId(null);
      await getDonors();
    }
    setSaving(false);
  }
  function editDonor(donor) {
    setName(donor.name);
    setEmail(donor.email);
    setEditingId(donor.id);
    setShowForm(true);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const filtered = donors.filter((donor) =>
    (donor.name + donor.email).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main className="page inner-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE PEOPLE BEHIND THE POSSIBLE</span>
          <h1>
            Good hearts. <span>Great company.</span>
          </h1>
          <p>Your donor community, and every contribution they make.</p>
        </div>
        <button
          className="button"
          onClick={() => {
            setName("");
            setEmail("");
            setEditingId(null);
            setShowForm(!showForm);
            setError("");
          }}
        >
          ＋ Add donor
        </button>
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
      {showForm && (
        <form className="data-form" onSubmit={saveDonor}>
          <h2>{editingId ? "Edit donor" : "Welcome a new donor"}</h2>
          <div className="form-grid">
            <label>
              Donor name
              <input
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Person or organization"
              />
            </label>
            <label>
              Email address <span className="optional">(optional)</span>
              <input
                type="email"
                maxLength={200}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button className="button" disabled={saving}>
              {saving ? "Saving…" : "Save donor"}
            </button>
          </div>
        </form>
      )}
      <div className="list-toolbar">
        <span>{donors.length} donors · live from Supabase</span>
        <input
          className="search-input"
          aria-label="Search donors"
          placeholder="Search by name or email…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {loading ? (
        <div className="empty-state">Loading donors…</div>
      ) : (
        <div className="donor-grid">
          {filtered.map((donor, index) => {
            const gifts = donations.filter(
              (donation) => donation.donor_id === donor.id,
            );
            const total = gifts
              .filter((gift) => gift.status === "Completed")
              .reduce((sum, gift) => sum + Number(gift.amount), 0);
            return (
              <article className="donor-card" key={donor.id}>
                <div className="donor-top">
                  <span className={`avatar avatar-${index % 3}`}>
                    {donor.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <button
                    className="text-button"
                    onClick={() => editDonor(donor)}
                  >
                    Edit
                  </button>
                </div>
                <h3>{donor.name}</h3>
                <p className="donor-email">{donor.email || "No email added"}</p>
                <div className="donor-impact">
                  <div>
                    <small>CONTRIBUTED</small>
                    <strong>₹{total.toLocaleString("en-IN")}</strong>
                  </div>
                  <span>{gifts.length} donations</span>
                </div>
                <Link
                  className="history-link"
                  to={`/history?donor=${donor.id}`}
                >
                  Contribution history <span>↗</span>
                </Link>
              </article>
            );
          })}
        </div>
      )}
      {!loading && !filtered.length && (
        <div className="empty-state">
          No donors found. Add a donor to get started.
        </div>
      )}
    </main>
  );
}
export default Donors;
